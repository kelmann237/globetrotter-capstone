import os
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

# Chemin vers le fichier users.json
USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.json')

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_users(users):
    # Crée le dossier 'data' automatiquement s'il n'existe pas
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    
    print("----------------------------------------")
    print("Données reçues du Front-End :", data)
    print("----------------------------------------")

    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    preferences = data.get('preferences', [])

    if not email or not password:
        print("❌ ÉCHEC : 'email' ou 'password' est vide/manquant.")
        return jsonify({"error": "L'email et le mot de passe sont obligatoires"}), 400

    users = load_users()
    if any(u.get('email') == email for u in users):
        print("❌ ÉCHEC : Email déjà utilisé.")
        return jsonify({"error": "Cet email est déjà utilisé"}), 400

    new_id = max([u.get('id', 0) for u in users], default=0) + 1
    new_user = {
        "id": new_id,
        "email": email,
        "password": password,
        "name": name,
        "preferences": preferences
    }

    users.append(new_user)
    save_users(users)
    
    print("✅ SUCCÈS : Utilisateur enregistré dans users.json !")

    return jsonify({
        "message": "Utilisateur créé avec succès",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "name": new_user["name"],
            "preferences": new_user["preferences"]
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "L'email et le mot de passe sont obligatoires"}), 400

    users = load_users()
    user = next((u for u in users if u.get('email') == email and u.get('password') == password), None)

    if not user:
        return jsonify({"error": "Identifiants invalides"}), 401

    user_id_str = str(user['id'])
    access_token = create_access_token(identity=user_id_str)

    return jsonify({
        "message": "Connexion réussie",
        "access_token": access_token,
        "token": access_token,  # Doublon utile pour éviter tout problème avec le JS
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }), 200