export const ErrorHandler = ({ error, className }) => (
    <div className={`${className} p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm`}>
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {error}
    </div>
  );