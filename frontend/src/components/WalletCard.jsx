const WalletCard = ({ type, balance }) => {
  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-yellow-400">
        {type} Wallet
      </h3>
      <p className="text-2xl text-white mt-2">
        ₹ {Number(balance).toFixed(2)}
      </p>
    </div>
  );
};

export default WalletCard;
