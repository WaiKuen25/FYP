import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const Message = (props) => {
  const title = props.title;
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="messageBox">
      <div className="topBox">
        <div className="title">{title}</div>
        <div className="icon-X" onClick={handleClose}>
          <FontAwesomeIcon icon={faX} />
        </div>
      </div>
      <div className="content">{props.children}</div>
    </div>
  );
};

export default Message;
