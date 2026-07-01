const StatCard = ({ title, value, icon: Icon, growth }) => {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-secondary text-sm font-medium">{title}</h3>
        {Icon && (
          <div className="p-2 bg-primary-light text-primary rounded-lg">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {growth && (
          <p className={`text-sm mt-2 font-medium ${growth.startsWith('+') ? 'text-success' : 'text-danger'}`}>
            {growth} from last month
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
