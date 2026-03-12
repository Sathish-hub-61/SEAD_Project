from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Import and register blueprints here later
    # from .routes import auth_bp, user_bp, admin_bp
    # app.register_blueprint(auth_bp)
    # app.register_blueprint(user_bp)
    # app.register_blueprint(admin_bp)

    return app
