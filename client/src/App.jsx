import "./App.css";
import Terminal from "./components/terminal";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  //   useEffect(() => {
  //     const originalFetch = window.fetch;

  //     const interceptRequests = () => {
  //       console.log('Monitoring network requests...');

  //       window.fetch = async (...args) => {
  //         try {
  //           const response = await originalFetch(...args);
  //           return response;
  //         } catch (error) {
  //           console.error('Network request failed:', error);
  //           throw error;
  //         }
  //       };
  //     };

  //     interceptRequests();

  //     return () => {
  //       window.fetch = originalFetch;
  //     };
  //   }, []);
  return (
    <ErrorBoundary>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files"></div>
          <div className="editor"></div>
        </div>
        <div className="terminal-container">
          <Terminal />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
