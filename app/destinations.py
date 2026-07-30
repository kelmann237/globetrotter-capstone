import os
import json
from flask import Blueprint, request, jsonify

destinations_bp = Blueprint('destinations', __name__)

DESTINATIONS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'destinations.json')

def load_destinations():
    if not os.path.exists(DESTINATIONS_FILE):
        return []
    with open(DESTINATIONS_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_destinations(destinations):
    with open(DESTINATIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(destinations, f, indent=2)

@destinations_bp.route('/destinations', methods=['GET'])
def get_destinations():
    destinations = load_destinations()
    return jsonify(destinations), 200

@destinations_bp.route('/destinations', methods=['POST'])
def add_destination():
    data = request.get_json() or {}
    name = data.get('name')
    country = data.get('country')

    if not name or not country:
        return jsonify({"error": "Le nom et le pays sont requis"}), 400

    destinations = load_destinations()
    new_id = max([d['id'] for d in destinations], default=0) + 1

    new_dest = {
        "id": new_id,
        "name": name,
        "country": country,
        "region": data.get('region', ''),
        "tags": data.get('tags', []),
        "description": data.get('description', ''),
        "budget_level": data.get('budget_level', 'medium')
    }

    destinations.append(new_dest)
    save_destinations(destinations)

    return jsonify(new_dest), 201