import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userToken, setUserToken] = useState(null); // Si null = Login, si rempli = Accueil
  const [product, setProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // ID de l'utilisateur connecté

  const API_URL = `http://192.168.1.141:3000/auth/${isLogin ? 'login' : 'register'}`;

  // Fonction pour se connecter
  const handleAuth = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserToken(data.token); // On stocke le token, ça nous "connecte"
        // TODO: Décoder le JWT pour récupérer l'ID utilisateur, ou modifie le backend pour renvoyer l'ID
        // setUserId(data.userId); 
      } else {
        Alert.alert("Erreur", "Identifiants incorrects");
      }
    } catch (error) {
      Alert.alert("Erreur", "Serveur injoignable");
    }
  };

  // FONCTION POUR AJOUTER UN REPAS À LA BASE DE DONNÉES
  const ajouterAuRepas = async () => {
    if (!product) return;

    try {
      const response = await fetch("http://192.168.1.141:3000/repas/ajouter-complet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ON UTILISE TON NOUVEL ID ICI
          id_profil: "93308442-16ea-4838-920a-a45fae6627ec",
          nom_produit: product.product_name || "Produit inconnu",
          nutriments: {
            cal: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
            prot: product.nutriments?.proteins_100g || 0,
            glu: product.nutriments?.carbohydrates_100g || 0,
            lip: product.nutriments?.fat_100g || 0
          },
          quantite: 100
        })
      });

      if (response.ok) {
        Alert.alert("Succès !", "Données nutritionnelles sauvegardées !");
      } else {
        Alert.alert("Erreur BDD", "Vérifie que le profil existe en base.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Le serveur ne répond pas");
    }
  };

  // FONCTION OPEN FOOD FACTS (Récupération de données)
  const fetchProduct = async () => {
    try {
      // Test avec un code-barres connu (ex: Nutella)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/3017620422003.json`);
      const data = await response.json();
      if (data.status === 1) {
        setProduct(data.product);
      } else {
        Alert.alert("Erreur", "Produit non trouvé");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de contacter OpenFoodFacts");
    }
  };

  // SI CONNECTÉ : ÉCRAN PRINCIPAL
  if (userToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recherche de produits</Text>

        <TextInput
          style={styles.input}
          placeholder="Tape un produit (ex: steak, pomme...)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            if (!searchQuery || loading) return; // On bloque si c'est vide ou si on charge déjà

            setLoading(true); // On active le chargement
            try {
              const response = await fetch(
                `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1`,
                {
                  headers: {
                    // REMPLACE PAR TON NOM OU NOM DE PROJET
                    'User-Agent': 'Food4Me - StageApp - Version 1.0'
                  }
                }
              );

              const data = await response.json();

              if (data.products && data.products.length > 0) {
                const foundProduct = data.products.find(p => p.product_name);
                setProduct(foundProduct || data.products[0]);
              } else {
                Alert.alert("Désolé", "Aucun produit trouvé.");
              }
            } catch (error) {
              Alert.alert("Oups", "L'API sature un peu. Attends 2 secondes !");
            } finally {
              setLoading(false); // On réactive le bouton quoi qu'il arrive
            }
          }}
        >
          <Text style={styles.buttonText}>
            {loading ? "Recherche en cours..." : "Chercher sur OpenFoodFacts"}
          </Text>
        </TouchableOpacity>

        {product && (
          <View style={styles.productCard}>
            <Image source={{ uri: product.image_front_url }} style={styles.productImg} />
            <Text style={styles.productName}>{product.product_name}</Text>

            {/* Affichage des valeurs nutritionnelles pour 100g */}
            <View style={styles.statsContainer}>
              <Text>🔥 Cal: {Math.round(product.nutriments?.['energy-kcal_100g'] || 0)} kcal</Text>
              <Text>🥩 Protéines: {product.nutriments?.proteins_100g || 0}g</Text>
              <Text>🍞 Glucides: {product.nutriments?.carbohydrates_100g || 0}g</Text>
              <Text>🥑 Lipides: {product.nutriments?.fat_100g || 0}g</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3498db', marginTop: 15 }]}
              onPress={ajouterAuRepas}
            >
              <Text style={styles.buttonText}>Ajouter ce repas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // SI NON CONNECTÉ : ÉCRAN LOGIN (Ton code actuel)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food4Me</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Se connecter' : "S'inscrire"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
        <Text style={{ color: '#3498db' }}>{isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Login"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#2ecc71', marginBottom: 20 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15 },
  button: { width: '100%', height: 50, backgroundColor: '#2ecc71', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  productCard: { marginTop: 30, padding: 20, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', width: '100%' },
  productImg: { width: 100, height: 100, marginBottom: 10 },
  productName: { fontSize: 18, fontWeight: 'bold' },
  brandText: { fontSize: 14, color: '#666', marginVertical: 5 },
  nutriBadge: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#2ecc71', borderRadius: 8 },
  nutriText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  addMealButton: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#e74c3c', borderRadius: 8 },
  addMealButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statsContainer: { marginTop: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, width: '100%' }
});