import NavMenu from "../../components/NavMenu";
import BottomNav from "../../components/BottomNav";
import gavanaImage from "../../assets/gavanaimg_0.webp";
import "./Gavana.css";

const Gavana = () => {
    return (
        <div className="gavana-container">
            <img
                src={gavanaImage}
                alt="Gavana Harbor"
                className="gavana-image"
            />

            <NavMenu locationId="gavana" />

            <div className="gavana-content">
                <h2>Welcome to Gavana 🏝️</h2>
                <p>This is the first harbor every new pirate visits. Enjoy your stay.</p>
            </div>
        </div>
    );
};

export default Gavana;
