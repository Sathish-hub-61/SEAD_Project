from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.models import User, Exam, Registration, RegistrationStatus, Payment, Correction, CorrectionStatus, AuditLog
from datetime import datetime
import re

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Get user's registrations
    registrations = Registration.query.filter_by(user_id=current_user_id).all()
    registration_data = []
    for reg in registrations:
        exam = Exam.query.get(reg.exam_id)
        registration_data.append({
            'id': reg.id,
            'exam_title': exam.title if exam else 'Unknown',
            'status': reg.status.value,
            'submitted_at': reg.submitted_at.isoformat() if reg.submitted_at else None,
            'reviewed_at': reg.reviewed_at.isoformat() if reg.reviewed_at else None,
            'review_reason': reg.review_reason
        })

    return jsonify({
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        },
        'registrations': registration_data
    }), 200

@user_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if request.method == 'GET':
        return jsonify({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': user.phone,
            'address': user.address
        }), 200

    # PUT request
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    # Validate email format
    if 'email' in data:
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        if User.query.filter(User.email == data['email'], User.id != user.id).first():
            return jsonify({'message': 'Email already in use'}), 409

    # Update fields
    allowed_fields = ['first_name', 'last_name', 'email', 'phone', 'address']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    user.updated_at = datetime.utcnow()
    db.session.commit()

    # Log profile update
    audit_log = AuditLog(
        user_id=user.id,
        action='profile_update',
        resource_type='user',
        resource_id=user.id,
        details='Profile updated'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({'message': 'Profile updated successfully'}), 200

@user_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    current_user_id = get_jwt_identity()
    exams = Exam.query.filter_by(is_active=True).all()
    exam_data = []

    for exam in exams:
        # Check if user already registered
        existing_reg = Registration.query.filter_by(user_id=current_user_id, exam_id=exam.id).first()
        is_registered = existing_reg is not None
        status = existing_reg.status.value if existing_reg else None

        exam_data.append({
            'id': exam.id,
            'title': exam.title,
            'description': exam.description,
            'exam_date': exam.exam_date.isoformat(),
            'registration_deadline': exam.registration_deadline.isoformat(),
            'fee': exam.fee,
            'max_participants': exam.max_participants,
            'is_registered': is_registered,
            'registration_status': status
        })

    return jsonify({'exams': exam_data}), 200

@user_bp.route('/exams/<int:exam_id>/register', methods=['POST'])
@jwt_required()
def register_for_exam(exam_id):
    current_user_id = get_jwt_identity()
    exam = Exam.query.get(exam_id)
    if not exam or not exam.is_active:
        return jsonify({'message': 'Exam not found or inactive'}), 404

    # Check if already registered
    existing_reg = Registration.query.filter_by(user_id=current_user_id, exam_id=exam_id).first()
    if existing_reg:
        return jsonify({'message': 'Already registered for this exam'}), 409

    # Check deadline
    if datetime.utcnow() > exam.registration_deadline:
        return jsonify({'message': 'Registration deadline has passed'}), 400

    # Check max participants
    current_registrations = Registration.query.filter_by(exam_id=exam_id).count()
    if exam.max_participants and current_registrations >= exam.max_participants:
        return jsonify({'message': 'Exam is full'}), 400

    registration = Registration(user_id=current_user_id, exam_id=exam_id)
    db.session.add(registration)
    db.session.commit()

    # Log registration
    audit_log = AuditLog(
        user_id=current_user_id,
        action='exam_registration',
        resource_type='registration',
        resource_id=registration.id,
        details=f'Registered for exam {exam.title}'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        'message': 'Registration successful',
        'registration_id': registration.id
    }), 201

@user_bp.route('/registrations/<int:registration_id>', methods=['GET', 'PUT'])
@jwt_required()
def manage_registration(registration_id):
    current_user_id = get_jwt_identity()
    registration = Registration.query.get(registration_id)
    if not registration or registration.user_id != current_user_id:
        return jsonify({'message': 'Registration not found'}), 404

    exam = Exam.query.get(registration.exam_id)

    if request.method == 'GET':
        return jsonify({
            'id': registration.id,
            'exam': {
                'id': exam.id,
                'title': exam.title,
                'exam_date': exam.exam_date.isoformat(),
                'fee': exam.fee
            },
            'status': registration.status.value,
            'submitted_at': registration.submitted_at.isoformat() if registration.submitted_at else None,
            'reviewed_at': registration.reviewed_at.isoformat() if registration.reviewed_at else None,
            'review_reason': registration.review_reason
        }), 200

    # PUT request - submit registration
    if registration.status != RegistrationStatus.DRAFT:
        return jsonify({'message': 'Registration already submitted'}), 400

    registration.status = RegistrationStatus.SUBMITTED
    registration.submitted_at = datetime.utcnow()
    db.session.commit()

    # Log submission
    audit_log = AuditLog(
        user_id=current_user_id,
        action='registration_submit',
        resource_type='registration',
        resource_id=registration.id,
        details=f'Submitted registration for exam {exam.title}'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({'message': 'Registration submitted successfully'}), 200

@user_bp.route('/registrations/<int:registration_id>/corrections', methods=['POST'])
@jwt_required()
def request_correction(registration_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not all(k in data for k in ('field_name', 'new_value')):
        return jsonify({'message': 'Missing required fields'}), 400

    registration = Registration.query.get(registration_id)
    if not registration or registration.user_id != current_user_id:
        return jsonify({'message': 'Registration not found'}), 404

    if registration.status not in [RegistrationStatus.REJECTED]:
        return jsonify({'message': 'Corrections only allowed for rejected registrations'}), 400

    correction = Correction(
        registration_id=registration_id,
        user_id=current_user_id,
        field_name=data['field_name'],
        new_value=data['new_value']
    )
    db.session.add(correction)
    db.session.commit()

    # Log correction request
    audit_log = AuditLog(
        user_id=current_user_id,
        action='correction_request',
        resource_type='correction',
        resource_id=correction.id,
        details=f'Correction requested for {data["field_name"]}'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({'message': 'Correction requested successfully'}), 201
