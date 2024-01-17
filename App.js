import logo from './logo.svg';
import './App.css';


function NewChild() {
    return (
        <button>
            Make a new child.
        </button>
    );
}

function FinishNode() {
    return (
        <button>
            Finish this Node.
        </button>
    );
}

export default function MainApp() {
    return (
        <div>
            <h1>Temporary Example of a Node</h1>
            <p><input type="text" id="Main Content"/></p>
            <NewChild/>
            <FinishNode/>
        </div>
    );
}