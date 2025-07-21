import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute -top-14 -left-10 w-28 h-28 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-10 w-28 h-28 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-12 left-20 w-28 h-28 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="relative space-y-6  backdrop-blur-sm p-10 rounded-3xl shadow-xl border border-white">
              <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-gray-100">
                404
              </h1>
              
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-600">
                  Page Not Found
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Oops! The page you're looking for doesn't exist or has been moved.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-700 to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                >
                  Go Back
                </button>
                
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="text-sm font-medium text-gray-100 hover:text-indigo-300 transition-colors"
                  >
                    Or return home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;