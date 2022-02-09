const Form = (props) => {
  const { show, handleClose, children } = props;
  const showHideClassName = show ? "modal" : "modal hide";

  return (
    <div className={showHideClassName}>
      <div className="modal-container">
        {children}
        <a href="#" className="modal-close" onClick={handleClose}>
          close
        </a>
      </div>
    </div>
  );
};
export default Form;
