import { useQuery } from "react-query";
import axios from "axios";

// Fetch from API
const fetchPosts = async () => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/posts"
  );
  return response.data;
};

function App() {
  // useQuery for search
  const { data, error, isLoading, isError } = useQuery("posts", fetchPosts);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      <h1>Post's list</h1>
      <ul>
        {data?.map((post: any) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
