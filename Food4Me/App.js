import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';

// 🔧 URL de l'API depuis les variables d'environnement
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.141:3000';

export default function App() {
  // États d'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Navigation post-connexion
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu', 'search', 'compose'

  // Recherche produit
  const [product, setProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const searchTimeout = useRef(null);

  // Composition manuelle (placeholder)
  const [ingredients, setIngredients] = useState('');

  const API_URL = `${API_BASE_URL}/auth/${isLogin ? 'login' : 'register'}`;

  // ─── AUTH ────────────────────────────────────────
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (!email.includes('@')) {
      Alert.alert("Erreur", "Adresse email invalide");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (!isLogin) {
          Alert.alert("Succès !", "Compte créé avec succès !");
        }
        setUserToken(data.token);
        setEmail('');
        setPassword('');
      } else {
        Alert.alert("Erreur", data.error || "Identifiants incorrects");
      }
    } catch (error) {
      Alert.alert("Erreur", "Serveur injoignable");
    }
  };

  const handleLogout = () => {
    setUserToken(null);
    setEmail('');
    setPassword('');
    setProduct(null);
    setSearchQuery('');
    setCurrentScreen('menu');
    Alert.alert("Déconnecté", "Vous êtes bien déconnecté.");
  };

  // ─── AJOUT REPAS ────────────────────────────────
  const ajouterAuRepas = async () => {
    if (!product) return;

    try {
      const response = await fetch(`${API_BASE_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

  // ─── RECHERCHE OFF ──────────────────────────────
  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query || loading) return;
    if (query === lastQuery) return;

    setLoading(true);
    setLastQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const url = `https://world.openfoodfacts.org/api/v1/search?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=5`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Food4Me - StageApp - Version 1.0'
          }
        });

        if (response.status === 429) {
          Alert.alert("Trop de requêtes", "Veuillez patienter avant de réessayer.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          Alert.alert("Erreur", `Erreur API : ${response.status}`);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.products && data.products.length > 0) {
          const foundProduct = data.products.find(p => p.product_name);
          setProduct(foundProduct || data.products[0]);
        } else {
          Alert.alert("Aucun résultat", "Aucun produit trouvé pour cette recherche.");
        }
      } catch (error) {
        Alert.alert("Erreur réseau", "Impossible de contacter OpenFoodFacts.");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // ─── INTERFACE CONNECTÉE ─────────────────────────
  if (userToken) {
    // ÉCRAN MENU
    if (currentScreen === 'menu') {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🍽️ Food4Me</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.menuTitle}>Que souhaitez-vous faire ?</Text>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#3498db' }]}
            onPress={() => {
              setSearchQuery('');
              setProduct(null);
              setCurrentScreen('search');
            }}
          >
            <Text style={styles.menuButtonText}>🔍 Ajouter un repas préparé</Text>
            <Text style={styles.menuButtonSub}>Rechercher un produit via OpenFoodFacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#2ecc71' }]}
            onPress={() => {
              setIngredients('');
              setCurrentScreen('compose');
            }}
          >
            <Text style={styles.menuButtonText}>🥗 Composer votre repas</Text>
            <Text style={styles.menuButtonSub}>Ajouter vos propres ingrédients</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ÉCRAN RECHERCHE
    if (currentScreen === 'search') {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('menu')}>
              <Text style={styles.backLink}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Recherche</Text>
            <View style={{ width: 60 }} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ex: Nutella, pomme, steak..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: loading ? '#95a5a6' : '#2ecc71' }]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "🔍 Recherche..." : "Chercher sur OpenFoodFacts"}
            </Text>
          </TouchableOpacity>

          {product && (
            <View style={styles.productCard}>
              {product.image_front_url && (
                <Image source={{ uri: product.image_front_url }} style={styles.productImg} />
              )}
              <Text style={styles.productName}>{product.product_name || "Produit inconnu"}</Text>
              <Text style={styles.brandText}>{product.brands || "Marque inconnue"}</Text>

              <View style={styles.statsContainer}>
                <Text>🔥 Calories: {Math.round(product.nutriments?.['energy-kcal_100g'] || 0)} kcal</Text>
                <Text>🥩 Protéines: {product.nutriments?.proteins_100g || 0}g</Text>
                <Text>🍞 Glucides: {product.nutriments?.carbohydrates_100g || 0}g</Text>
                <Text>🥑 Lipides: {product.nutriments?.fat_100g || 0}g</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#3498db', marginTop: 15 }]}
                onPress={ajouterAuRepas}
              >
                <Text style={styles.buttonText}>✓ Ajouter ce repas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    // ÉCRAN COMPOSITION
    if (currentScreen === 'compose') {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('menu')}>
              <Text style={styles.backLink}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Composer mon repas</Text>
            <View style={{ width: 60 }} />
          </View>

          <Text style={styles.subtitle}>Ajoutez vos ingrédients manuellement (bientôt disponible)</Text>

          <TextInput
            style={styles.input}
            placeholder="Ingrédients (ex: 200g poulet, 100g riz)"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
          />

          <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71' }]}>
            <Text style={styles.buttonText}>Calculer les valeurs nutritionnelles</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  // ─── UI LOGIN/REGISTER ───────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? 'Connexion' : 'Inscription'}
      </Text>
      <Text style={styles.subtitle}>
        {isLogin ? 'Bienvenue ! Connecte-toi.' : 'Crée un compte pour commencer.'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isLogin ? '#2ecc71' : '#3498db' }]}
        onPress={handleAuth}
      >
        <Text style={styles.buttonText}>
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsLogin(!isLogin)}
        style={{ marginTop: 25, padding: 10 }}
      >
        <Text style={styles.switchLink}>
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#2ecc71', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 25, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 14 },
  button: { width: '100%', height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#e74c3c', borderRadius: 8 },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  productCard: { marginTop: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', width: '100%' },
  productImg: { width: 120, height: 120, marginBottom: 10, borderRadius: 10 },
  productName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  brandText: { fontSize: 14, color: '#666', marginVertical: 5 },
  statsContainer: { marginTop: 15, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, width: '100%' },
  switchLink: { color: '#2980b9', fontSize: 16, fontWeight: '500', textAlign: 'center' },

  // Nouveaux styles pour le menu
  menuTitle: { fontSize: 22, fontWeight: '600', color: '#2c3e50', marginBottom: 30, marginTop: 20 },
  menuButton: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  menuButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  menuButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  backLink: { color: '#3498db', fontSize: 16, fontWeight: '600' },
});