import React from "react";
import "./EmojiPopup.css";

const EMOJIS = [
  { label: "Thumbs Up", value: "👍" },
  { label: "Thumbs Down", value: "👎" },
  { label: "Heart", value: "❤️" },
];

const EmojiPopup = ({ onSelect, onClose }) => {
  return (
    <div className="emoji-popup-backdrop" onClick={onClose}>
      <div className="emoji-popup-menu" onClick={e => e.stopPropagation()}>
        <div className="emoji-popup-title">React to this listener</div>
        <div className="emoji-popup-emojis">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji.value}
              className="emoji-popup-btn"
              onClick={() => onSelect(emoji.value)}
              aria-label={emoji.label}
            >
              {emoji.value}
            </button>
          ))}
        </div>
        <button className="emoji-popup-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EmojiPopup;
