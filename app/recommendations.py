import os
import json
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

recommendations_bp = Blueprint('recommendations', __name__)

USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.json')
DESTINATIONS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'destinations.json')

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

@recommendations_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    # Récupération de l'ID de l'utilisateur connecté depuis le token JWT
    current_user_id = int(get_jwt_identity())

    users = load_json(USERS_FILE)
    destinations = load_json(DESTINATIONS_FILE)

    user = next((u for u in users if u['id'] == current_user_id), None)
    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    user_prefs = set(user.get('preferences', []))

    # Filtrage des destinations ayant au moins un tag en commun avec les préférences de l'utilisateur
    recommended = []
    for dest in destinations:
        dest_tags = set(dest.get('tags', []))
        if user_prefs.intersection(dest_tags):
            recommended.append(dest)

    # Si aucune correspondance, on renvoie toutes les destinations par défaut
    if not recommended:
        recommended = destinations

    return jsonify({
        "user_id": current_user_id,
        "recommendations": recommended
    }), 200