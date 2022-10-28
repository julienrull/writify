import logo from './logo.svg';
import styles from './App.module.css';
import Editor from './components/editor/Editor';

function App() {
  return (
    <div class={styles.App}>
      <Editor/>
    </div>
  );
}

export default App;
