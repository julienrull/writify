import styles from './Editor.module.css';

function Editor() {

    const toggleStyle = function(e: MouseEvent) {
        e.preventDefault();
        let element : HTMLElement = e.currentTarget as HTMLElement;
        document.execCommand(element.id);
    }

    return (
        <div class={styles.Container}>
            <div class={styles.Commands}>
                <button id="bold" onClick={toggleStyle}><b>B</b></button>
                <button id="italic" onClick={toggleStyle}><i>I</i></button>
                <button id="underline" onClick={toggleStyle}><u>U</u></button>
                <button id="strikeThrough" onClick={toggleStyle}><s>S</s></button>
                <button id="justifyLeft" onClick={toggleStyle}>L</button>
                <button id="justifyRight" onClick={toggleStyle}>R</button>
                <button id="justifyCenter" onClick={toggleStyle}>C</button>
                <button id="justifyFull" onClick={toggleStyle}>J</button>
                <select name="heading" id="heading">
                    <option value="H1">H1</option>
                    <option value="H2">H2</option>
                    <option value="H3">H3</option>
                </select>
                <select name="font" id="font">
                    <option value="Arial">Arial</option>
                    <option value="Open-sans">Open-sans</option>
                </select>
                <select name="size" id="size">
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                </select>
                <div>
                    <input type="color" id="head" name="head"
                        value="#e66465"/>
                    <label for="head">Font color</label>
                </div>
            </div>
            <div class={styles.Editor} contentEditable={true}></div>
        </div>

        
    );
}

export default Editor;