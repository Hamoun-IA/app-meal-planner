# Intégration du Chat avec le Backend

## Vue d'ensemble

La page `/assistante` est maintenant entièrement connectée au backend avec les fonctionnalités suivantes :

- **Communication en temps réel** avec l'agent IA via l'API `/api/ai/chat`
- **Streaming de réponses** pour une expérience utilisateur fluide
- **Gestion d'erreurs** robuste avec messages d'erreur conviviaux
- **États de chargement** avec animations visuelles
- **Validation des entrées** côté client et serveur

## Architecture

### Frontend (React/Next.js)

#### Hook `useChat` (`hooks/use-chat.ts`)
```typescript
interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (message: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
```

**Fonctionnalités :**
- Gestion de l'état des messages
- Communication avec l'API via fetch
- Traitement du streaming SSE (Server-Sent Events)
- Gestion des erreurs et états de chargement

#### Composant `ChatMessageComponent` (`components/chat-message.tsx`)
- Affichage des messages avec animations
- Indicateurs de chargement avec points animés
- Styles conditionnels pour messages utilisateur/bot

### Backend (API Routes)

#### Route `/api/ai/chat` (`app/api/ai/chat/route.ts`)
```typescript
POST /api/ai/chat
{
  "message": "string",
  "context": "object (optionnel)"
}
```

**Fonctionnalités :**
- Validation des entrées avec Zod
- Streaming de réponses via ReadableStream
- Gestion d'erreurs avec AppError
- Communication avec l'agent ChatAgent

#### Agent IA (`lib/ai/agents.ts`)
```typescript
class ChatAgent {
  async chat(message: string, context?: any): Promise<string>
}
```

**Fonctionnalités :**
- Analyse du contexte (repas récents, préférences familiales)
- Génération de réponses personnalisées
- Intégration avec la base de données via Prisma

## Flux de données

1. **Envoi de message**
   ```
   Utilisateur → useChat.sendMessage() → API /api/ai/chat → ChatAgent
   ```

2. **Traitement IA**
   ```
   ChatAgent → Analyse contexte → Génération réponse → Streaming
   ```

3. **Réception réponse**
   ```
   Streaming → useChat (parsing SSE) → Mise à jour UI → Affichage
   ```

## Gestion des erreurs

### Côté Frontend
- **Erreurs réseau** : Message d'erreur convivial
- **Erreurs de parsing** : Gestion gracieuse des chunks SSE
- **Timeouts** : Retry automatique ou message d'erreur

### Côté Backend
- **Validation** : Erreurs Zod avec messages clairs
- **Erreurs IA** : Fallback vers message d'erreur
- **Erreurs DB** : Logging et message générique

## Animations et UX

### CSS Animations (`app/globals.css`)
```css
@keyframes fade-in-up { /* Messages qui apparaissent */ }
@keyframes float-slow { /* Particules de fond */ }
@keyframes float-medium { /* Particules de fond */ }
```

### États visuels
- **Chargement** : Points animés "● ● ●"
- **Erreur** : Message rouge avec bordure
- **Désactivé** : Boutons grisés pendant chargement

## Tests

### Test d'intégration (`test-chat-integration.js`)
```bash
node test-chat-integration.js
```

**Vérifie :**
- Réponse de l'endpoint
- Format SSE correct
- Streaming fonctionnel
- Communication avec l'agent IA

## Configuration requise

### Variables d'environnement
```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000000
```

### Dépendances
- `@langchain/openai` : Communication avec OpenAI
- `zod` : Validation des entrées
- `@prisma/client` : Accès à la base de données

## Utilisation

### Pour l'utilisateur
1. Naviguer vers `/assistante`
2. Taper un message dans le champ de saisie
3. Appuyer sur Entrée ou cliquer sur le bouton d'envoi
4. Voir la réponse de Babounette en temps réel

### Pour les développeurs
1. Le hook `useChat` gère toute la logique
2. Les messages sont automatiquement mis à jour
3. Les erreurs sont gérées gracieusement
4. Le streaming offre une expérience fluide

## Améliorations futures

- **Reconnaissance vocale** : Intégration Web Speech API
- **Historique persistant** : Sauvegarde des conversations
- **Suggestions rapides** : Boutons pour questions fréquentes
- **Mode hors ligne** : Cache des réponses précédentes
- **Personnalisation** : Thèmes et personnalités différentes 