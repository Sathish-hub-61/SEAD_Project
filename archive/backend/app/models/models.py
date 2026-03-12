from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from .. import db
import bcrypt

class UserRole(Enum):
    USER = 'user'
    ADMIN = 'admin'

class RegistrationStatus(Enum):
    DRAFT = 'draft'
    SUBMITTED = 'submitted'
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class CorrectionStatus(Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    role = Column(db.Enum(UserRole), nullable=False, default=UserRole.USER)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    registrations = relationship('Registration', back_populates='user')
    corrections = relationship('Correction', back_populates='user')
    audit_logs = relationship('AuditLog', back_populates='user')

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

class Exam(db.Model):
    __tablename__ = 'exams'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    exam_date = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=False)
    fee = Column(Float, nullable=False)
    max_participants = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    registrations = relationship('Registration', back_populates='exam')

class Registration(db.Model):
    __tablename__ = 'registrations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    exam_id = Column(Integer, ForeignKey('exams.id'), nullable=False)
    status = Column(db.Enum(RegistrationStatus), nullable=False, default=RegistrationStatus.DRAFT)
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey('users.id'))
    review_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship('User', back_populates='registrations', foreign_keys=[user_id])
    exam = relationship('Exam', back_populates='registrations')
    reviewer = relationship('User', foreign_keys=[reviewed_by])
    payments = relationship('Payment', back_populates='registration')
    corrections = relationship('Correction', back_populates='registration')

    __table_args__ = (UniqueConstraint('user_id', 'exam_id', name='unique_user_exam'),)

class Payment(db.Model):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True)
    registration_id = Column(Integer, ForeignKey('registrations.id'), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50))
    transaction_id = Column(String(100), unique=True)
    status = Column(String(20), default='pending')  # pending, completed, failed
    paid_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    registration = relationship('Registration', back_populates='payments')

class Correction(db.Model):
    __tablename__ = 'corrections'

    id = Column(Integer, primary_key=True)
    registration_id = Column(Integer, ForeignKey('registrations.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    field_name = Column(String(100), nullable=False)
    old_value = Column(Text)
    new_value = Column(Text, nullable=False)
    status = Column(db.Enum(CorrectionStatus), nullable=False, default=CorrectionStatus.PENDING)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey('users.id'))
    review_reason = Column(Text)
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    registration = relationship('Registration', back_populates='corrections')
    user = relationship('User', back_populates='corrections', foreign_keys=[user_id])
    reviewer = relationship('User', foreign_keys=[reviewed_by])

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='audit_logs')
