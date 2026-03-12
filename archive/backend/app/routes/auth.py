from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from .. import db, jwt
from ..models.models import User, UserRole, AuditLog
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not all(k in data for k in ('email', 'password', 'first_name', 'last_name')):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409

    user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        address=data.get('address'),
        role=UserRole.USER
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Log signup
    audit_log = AuditLog(
        user_id=user.id,
        action='signup',
        resource_type='user',
        resource_id=user.id,
        details='User signed up'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is disabled'}), 403

    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role.value})
    refresh_token = create_refresh_token(identity=user.id)

    # Log login
    audit_log = AuditLog(
        user_id=user.id,
        action='login',
        resource_type='user',
        resource_id=user.id,
        details='User logged in'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role.value
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user or not user.is_active:
        return jsonify({'message': 'Invalid token'}), 401

    access_token = create_access_token(identity=current_user, additional_claims={'role': user.role.value})
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    current_user = get_jwt_identity()
    jti = get_jwt()['jti']

    # In a real app, you'd add jti to a blacklist in Redis or DB
    # For simplicity, we'll just log the logout

    audit_log = AuditLog(
        user_id=current_user,
        action='logout',
        resource_type='user',
        resource_id=current_user,
        details='User logged out'
    )
    db.session.add(audit_log)
    db.session.commit()

    return jsonify({'message': 'Logged out successfully'}), 200

@jwt.user_identity_loader
def user_identity_lookup(user_id):
    return user_id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()
