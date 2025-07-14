export default function Modal({ children, onClose }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          {children}
          <button onClick={onClose} className="mt-4 text-red-500 underline">
            Fermer
          </button>
        </div>
      </div>
    );
  }
  