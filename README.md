# Guida Essenziale a React Query

React Query è una potente libreria per la gestione dello stato remoto, progettata per semplificare l'interazione con le API e migliorare la gestione della cache, la sincronizzazione e il recupero dei dati nel client.

## Installazione

Per utilizzare React Query nel tuo progetto, installa le dipendenze necessarie:

```bash
npm i react-query axios
```

## Concetti Principali

### 1. `useQuery`

`useQuery` è l'hook principale per recuperare dati da un'API o da una fonte esterna. Gestisce automaticamente stati di caricamento, successo, errore e caching.

#### Sintassi:

```tsx
const { data, error, isLoading, isError } = useQuery("queryKey", fetchFunction);
```

- **queryKey**: Chiave univoca per identificare la query (e per gestire il caching).
- **fetchFunction**: Funzione che esegue la chiamata API o recupera i dati.
- **Stati principali**:
  - **`isLoading`**: Indica che la query è in corso.
  - **`isError`**: Indica che si è verificato un errore durante la richiesta.
  - **`data`**: Contiene i dati recuperati quando la richiesta ha successo.
  - **`error`**: Contiene l'errore se qualcosa va storto.

#### Esempio:

```tsx
const fetchPosts = async () => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/posts"
  );
  return response.data;
};

const { data, error, isLoading, isError } = useQuery("posts", fetchPosts);

if (isLoading) return <div>Caricamento...</div>;
if (isError) return <div>Errore: {error.message}</div>;

return (
  <ul>
    {data.map((post) => (
      <li key={post.id}>{post.title}</li>
    ))}
  </ul>
);
```

### 2. `useMutation`

`useMutation` viene utilizzato per eseguire operazioni che **modificano** i dati (POST, PUT, DELETE). Non viene memorizzato in cache, ma è ottimo per operazioni che cambiano lo stato del server.

#### Sintassi:

```tsx
const mutation = useMutation(mutationFunction, {
  onSuccess: () => {
    /* Aggiorna la cache o fai altre operazioni */
  },
});
```

- **mutationFunction**: Funzione che esegue l'operazione di modifica (es. POST/PUT/DELETE).
- **onSuccess**: Callback che viene chiamata al termine della mutazione con successo.

#### Esempio:

```tsx
const createPost = async (newPost) => {
  const response = await axios.post(
    "https://jsonplaceholder.typicode.com/posts",
    newPost
  );
  return response.data;
};

const mutation = useMutation(createPost, {
  onSuccess: () => {
    // Aggiorna la cache dopo aver aggiunto un nuovo post
    queryClient.invalidateQueries("posts");
  },
});

// Funzione per gestire il submit
const handleSubmit = (newPost) => {
  mutation.mutate(newPost);
};
```

### 3. `useQueryClient`

`useQueryClient` è un hook che ti permette di interagire direttamente con la cache di React Query. Puoi invalidare una query (forzare il refetch), aggiornare manualmente i dati nella cache o accedere ad altre funzionalità avanzate di gestione dello stato.

#### Sintassi:

```tsx
const queryClient = useQueryClient();
```

#### Esempio di invalidazione della cache:

```tsx
const queryClient = useQueryClient();

// Forza il refetch dei dati
queryClient.invalidateQueries("posts");
```

### 4. Stati Avanzati in React Query

React Query gestisce in automatico molti stati relativi ai dati remoti. Ecco alcuni stati avanzati:

- **Stale e Fresh**: React Query gestisce i dati come "stale" o "fresh". I dati "fresh" sono quelli recenti, mentre i dati "stale" potrebbero essere refetchati dal server. Puoi configurare per quanto tempo i dati restano "fresh" con l'opzione `staleTime`.

  ```tsx
  useQuery("posts", fetchPosts, { staleTime: 5000 });
  ```

- **Refetching e Aggiornamenti automatici**: React Query può rifare automaticamente le query quando:

  - La finestra torna in focus (impostazione predefinita).
  - Viene cambiata la rete.

  Puoi anche abilitare il polling per aggiornare periodicamente i dati:

  ```tsx
  useQuery("posts", fetchPosts, { refetchInterval: 10000 }); // Rifà la query ogni 10 secondi
  ```

### 5. Ottimistic Updates (Aggiornamenti Ottimistici)

Gli aggiornamenti ottimistici permettono di aggiornare immediatamente l'interfaccia utente prima di ricevere la conferma del server. Questo migliora l'esperienza utente, specialmente in operazioni veloci.

#### Esempio:

```tsx
const mutation = useMutation(updatePost, {
  onMutate: async (newPost) => {
    await queryClient.cancelQueries("posts");
    const previousPosts = queryClient.getQueryData("posts");

    queryClient.setQueryData("posts", (oldPosts) =>
      oldPosts.map((post) => (post.id === newPost.id ? newPost : post))
    );

    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    queryClient.setQueryData("posts", context.previousPosts);
  },
  onSuccess: () => {
    queryClient.invalidateQueries("posts");
  },
});
```

### 6. Gestione degli Errori

React Query fornisce una gestione degli errori integrata. Puoi gestire gli errori a livello di query o mutazione oppure configurare un **Error Boundary** a livello di applicazione.

#### Esempio di gestione degli errori:

```tsx
const { data, error, isError } = useQuery("posts", fetchPosts, {
  retry: 2, // Riprova fino a 2 volte in caso di errore
  onError: (error) => {
    console.log("Errore:", error.message);
  },
});

if (isError) {
  return <div>Errore: {error.message}</div>;
}
```

## Devtools di React Query

React Query include Devtools che ti aiutano a monitorare le query e la cache durante lo sviluppo.

### Installazione:

```bash
pnpm add @tanstack/react-query-devtools
```

### Aggiunta nel progetto:

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>;
```

## Riassunto

React Query è un'ottima scelta per gestire dati remoti nelle applicazioni React, fornendo strumenti per caching, sincronizzazione automatica, refetching e molto altro. Con l'uso combinato di `useQuery`, `useMutation` e `useQueryClient`, puoi gestire sia letture che scritture in modo efficiente e reattivo.

Per ulteriori dettagli e personalizzazioni, consulta la documentazione ufficiale: https://react-query.tanstack.com/
