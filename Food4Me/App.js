// App.js (racine du projet)
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3000';

export default function App() {
  // Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userToken, setUserToken] = useState(null);

  const [objectif, setObjectif] = useState('Suivi Nutritionnel');
  const [taille, setTaille] = useState('170');
  const [poids, setPoids] = useState('70');
  const [genre, setGenre] = useState('Homme');
  const [age, setAge] = useState('30');

  // Navigation
  const [currentScreen, setCurrentScreen] = useState('menu');

  // Recherche produit
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchKey, setSearchKey] = useState(0);
  const abortController = useRef(null);

  // Composition repas
  const [composeItems, setComposeItems] = useState([]);
  const [composeNomRepas, setComposeNomRepas] = useState('');
  const [composeSearch, setComposeSearch] = useState('');
  const [composeFoundList, setComposeFoundList] = useState([]);
  const [composeFound, setComposeFound] = useState(null);
  const [composeGrams, setComposeGrams] = useState('100');   // ← Grammes préremplis à 100

  // Synthèse du jour
  const [dailyTotals, setDailyTotals] = useState(null);

  // Debounce pour recherche ingrédient en temps réel
  const debounceRef = useRef(null);

  const API_URL = `${API_BASE_URL}/auth/${isLogin ? 'login' : 'register'}`;

  // --- AUTH ---
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (!email.includes('@')) {
      Alert.alert("Erreur", "Adresse email invalide");
      return;
    }

    const payload = { email, password };
    if (!isLogin) {
      payload.objectif = objectif;
      payload.taille = parseInt(taille) || null;
      payload.poids = parseInt(poids) || null;
      payload.genre = genre;
      payload.age = parseInt(age) || null;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (!isLogin) Alert.alert("Succès !", "Compte créé avec succès !");
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
    setSearchResults([]);
    setSelectedProduct(null);
    setSearchQuery('');
    setCurrentScreen('menu');
    setComposeItems([]);
    setComposeNomRepas('');
    setSearchError(null);
    setDailyTotals(null);
    Alert.alert("Déconnecté", "Vous êtes bien déconnecté.");
  };

  // --- AJOUT REPAS (produit scanné) ---
  const ajouterAuRepas = async () => {
    if (!selectedProduct) return;
    try {
      const response = await fetch(`${API_BASE_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          nom_produit: selectedProduct.product_name || "Produit inconnu",
          nutriments: {
            cal: Math.round(selectedProduct.nutriments?.['energy-kcal_100g'] || 0),
            prot: selectedProduct.nutriments?.proteins_100g || 0,
            glu: selectedProduct.nutriments?.carbohydrates_100g || 0,
            lip: selectedProduct.nutriments?.fat_100g || 0
          },
          quantite: 100
        })
      });
      if (response.ok) {
        Alert.alert("Succès !", "Données nutritionnelles sauvegardées !");
        fetchDailyTotals();
        setSelectedProduct(null);
        setSearchResults([]);
        setCurrentScreen('menu');   // 🏠 Retour au menu automatique
      } else {
        const errorData = await response.json();
        Alert.alert("Erreur BDD", errorData.error || "Vérifie que le profil existe en base.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Le serveur ne répond pas");
    }
  };

  // --- RECHERCHE PRODUITS (OpenFoodFacts) ---
  const handleSearch = (autoRetry = false) => {
    const query = searchQuery.trim();
    if (!query || loading) return;

    if (abortController.current) abortController.current.abort();

    setLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setSelectedProduct(null);
    setSearchKey(prev => prev + 1);

    const controller = new AbortController();
    abortController.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const url = `${API_BASE_URL}/off/search?terme=${encodeURIComponent(query)}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        if (response.status === 429) {
          setSearchError({ message: "Trop de requêtes, veuillez patienter 1 minute." });
          setLoading(false);
          return;
        }
        if (response.status === 503) {
          setSearchError({ message: "Service Open Food Facts momentanément indisponible. Nouvelle tentative automatique dans 5 secondes..." });
          setLoading(false);
          setTimeout(() => handleSearch(true), 5000);
          return;
        }
        if (!response.ok) {
          response.json().catch(() => ({})).then(errData => {
            setSearchError({ message: errData.error || `Erreur serveur (${response.status})` });
          });
          setLoading(false);
          return;
        }
        return response.json();
      })
      .then(data => {
        if (!data) return;
        if (data.products && data.products.length > 0) {
          setSearchResults(data.products);
        } else {
          setSearchError({ message: "Aucun résultat pour cette recherche." });
        }
        setLoading(false);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          setSearchError({ message: "Délai dépassé. Le serveur ne répond pas." });
        } else {
          setSearchError({ message: "Impossible de contacter le serveur." });
          if (!autoRetry) {
            setTimeout(() => handleSearch(true), 5000);
          }
        }
        setLoading(false);
      });
  };

  // --- RECHERCHE INGRÉDIENT (en temps réel via useEffect) ---
  const handleSearchIngredient = async () => {
    const name = composeSearch.trim();
    if (!name) {
      setComposeFoundList([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/ingredients/recherche?nom=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.ingredients && data.ingredients.length > 0) {
        setComposeFoundList(data.ingredients);
        setComposeFound(null);
      } else {
        setComposeFoundList([]);
      }
    } catch (err) {
      setComposeFoundList([]);
    }
  };

  // useEffect pour déclencher la recherche avec debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearchIngredient();
    }, 300); // 300ms après la dernière frappe
    return () => clearTimeout(debounceRef.current);
  }, [composeSearch]);

  const selectIngredient = (ingredient) => {
    setComposeFound(ingredient);
    setComposeFoundList([]);
  };

  const addIngredient = () => {
    if (!composeFound || !composeGrams) return;
    const grams = parseFloat(composeGrams);
    if (isNaN(grams) || grams <= 0) {
      Alert.alert("Quantité invalide");
      return;
    }
    const newItem = {
      id: composeFound.id_ingredient,
      name: composeFound.nom,
      grams,
      cal: parseFloat(composeFound.calories_pour_100g),
      prot: parseFloat(composeFound.proteines_pour_100g),
      glu: parseFloat(composeFound.glucides_pour_100g),
      lip: parseFloat(composeFound.lipides_pour_100g),
    };
    setComposeItems([...composeItems, newItem]);
    setComposeSearch('');
    setComposeFound(null);
    setComposeFoundList([]);
    setComposeGrams('100');   // Réinitialise à 100g
  };

  const removeIngredient = (index) => {
    setComposeItems(composeItems.filter((_, i) => i !== index));
  };

  const totals = composeItems.reduce((acc, item) => {
    const ratio = item.grams / 100;
    return {
      cal: acc.cal + item.cal * ratio,
      prot: acc.prot + item.prot * ratio,
      glu: acc.glu + item.glu * ratio,
      lip: acc.lip + item.lip * ratio,
    };
  }, { cal: 0, prot: 0, glu: 0, lip: 0 });

  // --- SAUVEGARDE REPAS COMPOSÉ ---
  const saveComposedMeal = async () => {
    if (!composeNomRepas || composeItems.length === 0) {
      Alert.alert("Erreur", "Donnez un nom au repas et ajoutez au moins un ingrédient.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/repas/ajouter-complet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          nom_produit: composeNomRepas,
          nutriments: {
            cal: Math.round(totals.cal),
            prot: totals.prot,
            glu: totals.glu,
            lip: totals.lip
          },
          quantite: 100
        })
      });

      if (response.ok) {
        Alert.alert("Succès !", "Repas sauvegardé avec ses valeurs nutritionnelles !");
        setComposeItems([]);
        setComposeNomRepas('');
        fetchDailyTotals();
        setCurrentScreen('menu');   // 🏠 Retour automatique au menu
      } else {
        const errorData = await response.json();
        Alert.alert("Erreur", errorData.error || "Sauvegarde impossible.");
      }
    } catch (err) {
      Alert.alert("Erreur", "Le serveur ne répond pas.");
    }
  };

  // --- SYNTHESE DU JOUR ---
  const fetchDailyTotals = async () => {
    if (!userToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/repas/aujourdhui`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDailyTotals(data);
      }
    } catch (error) {
      console.log("Erreur synthèse jour", error);
    }
  };

  useEffect(() => {
    if (currentScreen === 'menu' && userToken) {
      fetchDailyTotals();
    }
  }, [currentScreen, userToken]);

  // --- RENDU DES ÉCRANS ---
  if (userToken) {
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
            onPress={() => { setSearchQuery(''); setSearchResults([]); setSelectedProduct(null); setSearchError(null); setCurrentScreen('search'); }}
          >
            <Text style={styles.menuButtonText}>🔍 Ajouter un repas préparé</Text>
            <Text style={styles.menuButtonSub}>Rechercher un produit via OpenFoodFacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#2ecc71' }]}
            onPress={() => {
              setComposeItems([]);
              setComposeNomRepas('');
              setComposeSearch('');
              setComposeFound(null);
              setComposeFoundList([]);
              setComposeGrams('100');   // prérempli à 100
              setCurrentScreen('compose');
            }}
          >
            <Text style={styles.menuButtonText}>🥗 Composer votre repas</Text>
            <Text style={styles.menuButtonSub}>Ajouter vos propres ingrédients</Text>
          </TouchableOpacity>

          {dailyTotals && (
            <View style={styles.dailyCard}>
              <Text style={styles.dailyTitle}>📊 Aujourd'hui</Text>
              <View style={styles.dailyRow}>
                <Text style={styles.dailyMacro}>🔥 Calories : {dailyTotals.calories} kcal</Text>
                <Text style={styles.dailyMacro}>🥩 Protéines : {dailyTotals.proteines} g</Text>
                <Text style={styles.dailyMacro}>🍞 Glucides : {dailyTotals.glucides} g</Text>
                <Text style={styles.dailyMacro}>🥑 Lipides : {dailyTotals.lipides} g</Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    if (currentScreen === 'search') {
      // ... (inchangé par rapport à votre code actuel, avec le retour au menu après ajout déjà inclus)
      // Je laisse votre version, elle contient déjà setCurrentScreen('menu') dans ajouterAuRepas
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { setCurrentScreen('menu'); abortController.current?.abort(); }}>
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
            onSubmitEditing={() => handleSearch(false)}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: loading ? '#95a5a6' : '#2ecc71' }]}
            onPress={() => handleSearch(false)}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Recherche...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Chercher sur OpenFoodFacts</Text>
            )}
          </TouchableOpacity>

          {searchError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{searchError.message}</Text>
              <TouchableOpacity onPress={() => handleSearch(false)}>
                <Text style={styles.retryButton}>↻ Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {searchResults.length > 0 && !selectedProduct && (
            <ScrollView key={searchKey} style={styles.resultsList}>
              <Text style={styles.resultsTitle}>Produits trouvés :</Text>
              {searchResults.map((product, index) => (
                <TouchableOpacity
                  key={product.code || index.toString()}
                  style={styles.resultItem}
                  onPress={() => setSelectedProduct(product)}
                >
                  {product.image_front_url && (
                    <Image source={{ uri: product.image_front_url }} style={styles.resultImg} />
                  )}
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultName} numberOfLines={2}>{product.product_name || "Sans nom"}</Text>
                    <Text style={styles.resultBrand}>{product.brands || "Marque inconnue"}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {selectedProduct && (
            <View style={styles.productCard}>
              <TouchableOpacity style={styles.backToListButton} onPress={() => setSelectedProduct(null)}>
                <Text style={styles.backLink}>← Retour à la liste</Text>
              </TouchableOpacity>
              {selectedProduct.image_front_url && (
                <Image source={{ uri: selectedProduct.image_front_url }} style={styles.productImg} />
              )}
              <Text style={styles.productName}>{selectedProduct.product_name || "Produit inconnu"}</Text>
              <Text style={styles.brandText}>{selectedProduct.brands || "Marque inconnue"}</Text>
              <View style={styles.statsContainer}>
                <Text>🔥 Calories: {Math.round(selectedProduct.nutriments?.['energy-kcal_100g'] || 0)} kcal</Text>
                <Text>🥩 Protéines: {selectedProduct.nutriments?.proteins_100g || 0}g</Text>
                <Text>🍞 Glucides: {selectedProduct.nutriments?.carbohydrates_100g || 0}g</Text>
                <Text>🥑 Lipides: {selectedProduct.nutriments?.fat_100g || 0}g</Text>
              </View>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#3498db', marginTop: 15 }]} onPress={ajouterAuRepas}>
                <Text style={styles.buttonText}>✓ Ajouter ce repas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

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

          <TextInput
            style={styles.input}
            placeholder="Nom du repas (ex: Lasagnes maison)"
            value={composeNomRepas}
            onChangeText={setComposeNomRepas}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 2, marginBottom: 0 }]}
              placeholder="Ingrédient (ex: poulet)"
              value={composeSearch}
              onChangeText={setComposeSearch}   // la recherche se lance automatiquement
            />
            <TouchableOpacity style={[styles.button, { flex: 1, marginLeft: 10 }]} onPress={handleSearchIngredient}>
              <Text style={styles.buttonText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {composeFoundList.length > 0 && !composeFound && (
            <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled={true}>
              {composeFoundList.map((ing) => (
                <TouchableOpacity
                  key={ing.id_ingredient}
                  style={styles.suggestionItem}
                  onPress={() => selectIngredient(ing)}
                >
                  <Text style={styles.suggestionText}>{ing.nom}</Text>
                  <Text style={styles.suggestionSub}>
                    {ing.calories_pour_100g} kcal · P{ing.proteines_pour_100g} G{ing.glucides_pour_100g} L{ing.lipides_pour_100g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {composeFound && (
            <View style={styles.foundCard}>
              <Text style={styles.productName}>{composeFound.nom}</Text>
              <TextInput
                style={styles.input}
                placeholder="Grammes"
                value={composeGrams}
                onChangeText={setComposeGrams}
                keyboardType="numeric"
              />
              <View style={styles.row}>
                <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#27ae60' }]} onPress={addIngredient}>
                  <Text style={styles.buttonText}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#95a5a6', marginLeft: 10 }]} onPress={() => setComposeFound(null)}>
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {composeItems.length > 0 && (
            <View style={styles.listContainer}>
              <Text style={styles.subtitle}>Ingrédients ajoutés :</Text>
              {composeItems.map((item, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <Text style={styles.ingredientItem}>🥄 {item.name} - {item.grams}g</Text>
                  <TouchableOpacity onPress={() => removeIngredient(idx)}>
                    <Text style={styles.removeText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.statsContainer}>
            <Text>🔥 Calories: {Math.round(totals.cal)} kcal</Text>
            <Text>🥩 Protéines: {totals.prot.toFixed(1)}g</Text>
            <Text>🍞 Glucides: {totals.glu.toFixed(1)}g</Text>
            <Text>🥑 Lipides: {totals.lip.toFixed(1)}g</Text>
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71' }]} onPress={saveComposedMeal}>
            <Text style={styles.buttonText}>💾 Sauvegarder ce repas</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  // --- LOGIN/REGISTER (inchangé) ---
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Bienvenue ! Connecte-toi.' : 'Crée un compte pour commencer.'}
          </Text>
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          {!isLogin && (
            <>
              <Text style={styles.sectionTitle}>Profil (optionnel)</Text>
              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Taille (cm)" value={taille} onChangeText={setTaille} keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="Poids (kg)" value={poids} onChangeText={setPoids} keyboardType="numeric" />
              </View>
              <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Âge" value={age} onChangeText={setAge} keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="Genre" value={genre} onChangeText={setGenre} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Objectif (ex: perte de poids, maintien, prise de masse)"
                value={objectif}
                onChangeText={setObjectif}
              />
            </>
          )}

          <TouchableOpacity style={[styles.button, { backgroundColor: isLogin ? '#2ecc71' : '#3498db' }]} onPress={handleAuth}>
            <Text style={styles.buttonText}>{isLogin ? 'Se connecter' : "S'inscrire"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 25, padding: 10 }}>
            <Text style={styles.switchLink}>{isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- STYLES (inchangés) ---
const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  container: { flex: 1, backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2ecc71', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7f8c8d', marginBottom: 25, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 10, alignSelf: 'flex-start' },
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
  menuTitle: { fontSize: 22, fontWeight: '600', color: '#2c3e50', marginBottom: 30, marginTop: 20 },
  menuButton: { width: '100%', paddingVertical: 20, paddingHorizontal: 15, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
  menuButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  menuButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  backLink: { color: '#3498db', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  foundCard: { marginTop: 10, padding: 15, backgroundColor: '#e8f8f5', borderRadius: 10, width: '100%', marginBottom: 10 },
  listContainer: { marginTop: 10, width: '100%' },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  ingredientItem: { fontSize: 16 },
  removeText: { fontSize: 18, color: '#e74c3c' },
  suggestionsContainer: { maxHeight: 150, width: '100%', backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  suggestionItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  suggestionText: { fontSize: 16, fontWeight: '500' },
  suggestionSub: { fontSize: 12, color: '#666', marginTop: 2 },
  errorCard: { marginTop: 15, padding: 15, backgroundColor: '#ffeaa7', borderRadius: 10, width: '100%', alignItems: 'center' },
  errorText: { color: '#d63031', fontSize: 14, marginBottom: 10, textAlign: 'center' },
  retryButton: { color: '#0984e3', fontWeight: 'bold', fontSize: 16, paddingVertical: 5, paddingHorizontal: 15 },
  dailyCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dailyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12, textAlign: 'center' },
  dailyRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  dailyMacro: { fontSize: 14, color: '#555', marginVertical: 4, width: '45%', textAlign: 'center' },
  resultsList: { width: '100%', marginTop: 15 },
  resultsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
  resultItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  resultImg: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  resultTextContainer: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600' },
  resultBrand: { fontSize: 12, color: '#666' },
  backToListButton: { alignSelf: 'flex-start', marginBottom: 10 },
});