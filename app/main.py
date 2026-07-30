from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # 1. Importation de Flask-CORS

app = Flask(__name__)

# 2. Activation de CORS pour autoriser toutes les requêtes (HTTP et file://)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Clé secrète pour signer les jetons JWT
app.config["JWT_SECRET_KEY"] = "super-secret-key"
jwt = JWTManager(app)

# Importer et enregistrer les modules (Blueprints)
from app.auth import auth_bp
from app.destinations import destinations_bp
from app.recommendations import recommendations_bp
from app.itineraries import itineraries_bp

app.register_blueprint(auth_bp)
app.register_blueprint(destinations_bp)
app.register_blueprint(recommendations_bp)
app.register_blueprint(itineraries_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)