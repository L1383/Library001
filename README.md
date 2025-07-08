# Library
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رمان‌هایی که خوانده‌ام</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>
    <!-- Google Fonts - Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar for better aesthetics */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
            background: #a78bfa; /* purple-400 */
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #8b5cf6; /* purple-500 */
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4 font-sans text-gray-800">
    <div id="root"></div>

    <!-- React and ReactDOM CDNs -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <!-- Babel for JSX transformation in browser -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <!-- Firebase SDKs -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { 
            getAuth, 
            signInAnonymously, 
            signInWithCustomToken, 
            onAuthStateChanged,
            createUserWithEmailAndPassword, // New import for signup
            signInWithEmailAndPassword,     // New import for login
            signOut                         // New import for logout
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Your Firebase configuration (using the one provided by the user)
        const firebaseConfig = {
            apiKey: "AIzaSyAmZeIOUi-M52OG0eiy5bPFHNydAoqv8hg",
            authDomain: "library-fbfe6.firebaseapp.com",
            projectId: "library-fbfe6",
            storageBucket: "library-fbfe6.firebasestorage.app",
            messagingSenderId: "446025119683",
            appId: "1:446025119683:web:9b4db2c4af306c12a66f76",
            measurementId: "G-X13WFMTPMZ"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        window.db = getFirestore(app); // Make db globally accessible
        window.auth = getAuth(app); // Make auth globally accessible
        window.firebaseConfig = firebaseConfig; // Make firebaseConfig globally accessible

        // Make Firebase functions globally accessible for the React script
        // Explicitly assign imported functions to window object
        window.onAuthStateChanged = onAuthStateChanged;
        window.signInAnonymously = signInAnonymously;
        window.signInWithCustomToken = signInWithCustomToken;
        window.createUserWithEmailAndPassword = createUserWithEmailAndPassword; // Make signup function global
        window.signInWithEmailAndPassword = signInWithEmailAndPassword;     // Make login function global
        window.signOut = signOut;                                           // Make logout function global
        window.collection = collection;
        window.addDoc = addDoc;
        window.onSnapshot = onSnapshot;
        window.doc = doc;
        window.updateDoc = updateDoc;
        window.deleteDoc = deleteDoc;
        window.query = query;
        window.where = where;
    </script>

    <script type="text/babel">
        // Main App component
        function App() {
            // State variables for the application
            const [novels, setNovels] = React.useState([]); // Stores the list of novels
            const [newNovel, setNewNovel] = React.useState({ // Stores data for a new novel
                title: '',
                author: '',
                genre: '',
                rating: '',
                notes: '',
                chaptersRead: '',
                totalChapters: '',
                isFavorite: false, // Field for favorite status
                readingStatus: 'not_started' // New field for reading status: 'not_started', 'reading', 'publishing', 'completed'
            });
            const [editingNovelId, setEditingNovelId] = React.useState(null); // ID of the novel being edited
            const [confirmDeleteId, setConfirmDeleteId] = React.useState(null); // ID of the novel pending deletion confirmation
            const [loading, setLoading] = React.useState(true); // Loading state
            const [dbInstance, setDbInstance] = React.useState(null); // Firestore instance
            const [authInstance, setAuthInstance] = React.useState(null); // Firebase Auth instance
            const [userId, setUserId] = React.useState(null); // Current user ID
            const [isAuthReady, setIsAuthReady] = React.useState(false); // Flag to check if Firebase Auth is ready
            const [errorMessage, setErrorMessage] = React.useState(null); // State for general error messages
            const [authErrorMessage, setAuthErrorMessage] = React.useState(null); // State for authentication specific error messages

            // New state variables for authentication
            const [email, setEmail] = React.useState('');
            const [password, setPassword] = React.useState('');
            const [isLoginMode, setIsLoginMode] = React.useState(true); // true for login, false for signup

            // State variables for search and filters
            const [searchTerm, setSearchTerm] = React.useState('');
            const [filterGenre, setFilterGenre] = React.useState('همه'); // 'همه' for all genres
            const [filterReadingStatus, setFilterReadingStatus] = React.useState('همه'); // 'همه', 'تکمیل شده', 'در حال مطالعه', 'در حال انتشار', 'هنوز شروع نشده'
            const [showFavorites, setShowFavorites] = React.useState(false); // Toggle to show only favorites

            // Initialize Firebase and handle authentication
            React.useEffect(() => {
                // Firebase instances are now available globally from the module script above
                setDbInstance(window.db); // Use the global db from the module script
                setAuthInstance(window.auth); // Use the global auth from the module script

                // Listen for auth state changes
                const unsubscribe = window.onAuthStateChanged(window.auth, (user) => {
                    if (user) {
                        setUserId(user.uid);
                        setLoading(false); // Stop loading once user state is determined
                    } else {
                        setUserId(null); // No user logged in
                        setLoading(false); // Stop loading even if no user
                    }
                    setIsAuthReady(true); // Auth is ready
                });

                return () => unsubscribe(); // Cleanup auth listener
            }, []); // Empty dependency array means this runs once on mount

            // Fetch novels when auth is ready and userId is available
            React.useEffect(() => {
                if (dbInstance && userId && isAuthReady) {
                    // Use firebaseConfig.appId instead of projectId for standalone
                    const novelCollectionRef = window.collection(dbInstance, `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`); // Changed from projectId to appId
                    const q = window.query(novelCollectionRef);

                    const unsubscribe = window.onSnapshot(q, (snapshot) => {
                        const fetchedNovels = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        fetchedNovels.sort((a, b) => a.title.localeCompare(b.title));
                        setNovels(fetchedNovels);
                        setLoading(false);
                    }, (error) => {
                        console.error("خطا در دریافت رمان‌ها:", error);
                        setErrorMessage("خطا در دریافت رمان‌ها: " + error.message);
                        setLoading(false);
                    });

                    return () => unsubscribe(); // Cleanup snapshot listener
                } else if (isAuthReady && !userId) {
                    // If auth is ready but no user is logged in, clear novels and stop loading
                    setNovels([]);
                    setLoading(false);
                }
            }, [dbInstance, userId, isAuthReady]);

            // Handle input changes in the form
            const handleChange = (e) => {
                const { name, value, type, checked } = e.target;
                setNewNovel(prev => ({
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                }));
            };

            // Handle authentication form submission (login/signup)
            const handleAuthSubmit = async (e) => {
                e.preventDefault();
                setAuthErrorMessage(null); // Clear previous auth errors
                setLoading(true);
                try {
                    if (isLoginMode) {
                        await window.signInWithEmailAndPassword(authInstance, email, password);
                    } else {
                        await window.createUserWithEmailAndPassword(authInstance, email, password);
                    }
                    // Clear form fields
                    setEmail('');
                    setPassword('');
                } catch (error) {
                    console.error("خطا در احراز هویت:", error);
                    let userFriendlyMessage = "خطا در احراز هویت. لطفاً دوباره تلاش کنید.";
                    switch (error.code) {
                        case 'auth/invalid-email':
                            userFriendlyMessage = "ایمیل نامعتبر است.";
                            break;
                        case 'auth/user-disabled':
                            userFriendlyMessage = "این حساب کاربری غیرفعال شده است.";
                            break;
                        case 'auth/user-not-found':
                            userFriendlyMessage = "کاربری با این ایمیل یافت نشد.";
                            break;
                        case 'auth/wrong-password':
                            userFriendlyMessage = "رمز عبور اشتباه است.";
                            break;
                        case 'auth/email-already-in-use':
                            userFriendlyMessage = "این ایمیل قبلاً ثبت‌نام شده است.";
                            break;
                        case 'auth/weak-password':
                            userFriendlyMessage = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
                            break;
                        case 'auth/invalid-credential': // Specific handling for invalid-credential
                            userFriendlyMessage = "ایمیل یا رمز عبور اشتباه است. لطفاً دوباره بررسی کنید.";
                            break;
                        case 'auth/network-request-failed': // Handle network issues
                            userFriendlyMessage = "خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.";
                            break;
                        default:
                            userFriendlyMessage = "خطای ناشناخته در احراز هویت: " + error.message;
                    }
                    setAuthErrorMessage(userFriendlyMessage);
                } finally {
                    setLoading(false);
                }
            };

            // Handle user logout
            const handleLogout = async () => {
                setLoading(true);
                try {
                    await window.signOut(authInstance);
                    setNovels([]); // Clear novels on logout
                    setUserId(null); // Clear user ID
                } catch (error) {
                    console.error("خطا در خروج از سیستم:", error);
                    setErrorMessage("خطا در خروج از سیستم: " + error.message);
                } finally {
                    setLoading(false);
                }
            };

            // Add a new novel or update an existing one
            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!dbInstance || !userId) {
                    setErrorMessage("خطا: برای افزودن/ویرایش رمان باید وارد شوید.");
                    return;
                }

                setLoading(true);
                try {
                    const collectionPath = `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`; // Changed to appId
                    if (editingNovelId) {
                        const novelDocRef = window.doc(dbInstance, collectionPath, editingNovelId);
                        await window.updateDoc(novelDocRef, newNovel);
                        setEditingNovelId(null); // Exit edit mode
                    } else {
                        await window.addDoc(window.collection(dbInstance, collectionPath), newNovel);
                    }
                    // Clear the form
                    setNewNovel({ title: '', author: '', genre: '', rating: '', notes: '', chaptersRead: '', totalChapters: '', isFavorite: false, readingStatus: 'not_started' });
                } catch (error) {
                    console.error("خطا در افزودن/به‌روزرسانی رمان:", error);
                    if (error.code === 'not-found' && editingNovelId) {
                        setErrorMessage("خطا: رمان مورد نظر برای ویرایش یافت نشد. ممکن است توسط شخص دیگری یا از طریق کنسول حذف شده باشد.");
                        setEditingNovelId(null); // Reset editing state
                        setNewNovel({ title: '', author: '', genre: '', rating: '', notes: '', chaptersRead: '', totalChapters: '', isFavorite: false, readingStatus: 'not_started' }); // Clear form
                    } else {
                        setErrorMessage("خطا در عملیات: " + error.message);
                    }
                } finally {
                    setLoading(false);
                }
            };

            // Set up form for editing a novel
            const handleEditClick = (novel) => {
                setEditingNovelId(novel.id);
                setNewNovel({
                    title: novel.title,
                    author: novel.author,
                    genre: novel.genre,
                    rating: novel.rating || '',
                    notes: novel.notes,
                    chaptersRead: novel.chaptersRead || '',
                    totalChapters: novel.totalChapters || '',
                    isFavorite: novel.isFavorite || false,
                    readingStatus: novel.readingStatus || 'not_started' // Populate new field, default to 'not_started'
                });
            };

            // Cancel editing and clear the form
            const handleCancelEdit = () => {
                setEditingNovelId(null);
                setNewNovel({ title: '', author: '', genre: '', rating: '', notes: '', chaptersRead: '', totalChapters: '', isFavorite: false, readingStatus: 'not_started' });
            };

            // Show delete confirmation modal
            const handleDeleteClick = (id) => {
                setConfirmDeleteId(id);
            };

            // Confirm and delete the novel
            const handleConfirmDelete = async () => {
                if (!dbInstance || !userId || !confirmDeleteId) {
                    setErrorMessage("خطا: پایگاه داده در دسترس نیست یا رمان برای حذف مشخص نشده است.");
                    return;
                }

                setLoading(true);
                try {
                    const collectionPath = `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`; // Changed to appId
                    await window.deleteDoc(window.doc(dbInstance, collectionPath, confirmDeleteId));
                    setConfirmDeleteId(null); // Close confirmation modal
                } catch (error) {
                    console.error("خطا در حذف رمان:", error);
                    setErrorMessage("خطا در حذف رمان: " + error.message);
                } finally {
                    setLoading(false);
                }
            };

            // Cancel delete operation
            const handleCancelDelete = () => {
                setConfirmDeleteId(null);
            };

            // Toggle favorite status
            const toggleFavorite = async (novelId, currentStatus) => {
                if (!dbInstance || !userId) return;
                setLoading(true);
                try {
                    const novelDocRef = window.doc(dbInstance, `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`, novelId); // Changed to appId
                    await window.updateDoc(novelDocRef, { isFavorite: !currentStatus });
                } catch (error) {
                    console.error("خطا در به‌روزرسانی وضعیت مورد علاقه:", error);
                    setErrorMessage("خطا در به‌روزرسانی وضعیت مورد علاقه: " + error.message);
                } finally {
                    setLoading(false);
                }
            };

            // Filtered novels based on search term and filters
            const filteredNovels = novels.filter(novel => {
                // Search filter
                const matchesSearch = novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      novel.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      novel.notes.toLowerCase().includes(searchTerm.toLowerCase());

                // Genre filter
                const matchesGenre = filterGenre === 'همه' || (novel.genre && novel.genre.toLowerCase() === filterGenre.toLowerCase());

                // Reading Status filter
                const matchesReadingStatus = filterReadingStatus === 'همه' || novel.readingStatus === filterReadingStatus;

                // Favorite filter
                const matchesFavorite = !showFavorites || novel.isFavorite;

                return matchesSearch && matchesGenre && matchesReadingStatus && matchesFavorite;
            });

            // Extract unique genres for the filter dropdown
            const uniqueGenres = ['همه', ...new Set(novels.map(novel => novel.genre).filter(Boolean))];

            // Render the application UI
            return (
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 space-y-8">
                    <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-8">
                        <i className="fas fa-book-reader mr-3"></i> رمان‌هایی که خوانده‌ام
                    </h1>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
                            <p className="ml-4 text-lg text-purple-600">در حال بارگذاری...</p>
                        </div>
                    )}

                    {/* Conditional rendering based on authentication state */}
                    {(() => {
                        if (!isAuthReady) {
                            return <div className="text-center text-gray-500 text-lg">در حال آماده‌سازی احراز هویت...</div>;
                        } else if (!userId) {
                            return (
                                /* Authentication Forms (Login/Signup) */
                                <div className="bg-purple-50 p-6 rounded-lg shadow-md space-y-4">
                                    <h2 className="text-2xl font-bold text-purple-600 text-center mb-4">
                                        {isLoginMode ? 'ورود به حساب کاربری' : 'ثبت‌نام حساب جدید'}
                                    </h2>
                                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ایمیل:</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="ایمیل خود را وارد کنید"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">رمز عبور:</label>
                                            <input
                                                type="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="رمز عبور خود را وارد کنید"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                required
                                            />
                                        </div>
                                        {authErrorMessage && (
                                            <p className="text-red-600 text-sm text-center">{authErrorMessage}</p>
                                        )}
                                        <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                                                disabled={loading}
                                            >
                                                {isLoginMode ? 'ورود' : 'ثبت‌نام'}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={() => setIsLoginMode(!isLoginMode)}
                                            className="text-purple-600 hover:text-purple-800 font-semibold transition duration-200"
                                        >
                                            {isLoginMode ? 'حساب کاربری ندارید؟ ثبت‌نام کنید.' : 'قبلاً حساب کاربری دارید؟ وارد شوید.'}
                                        </button>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                /* Main Application Content */
                                <>
                                    {/* Display User ID and Logout Button */}
                                    <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg shadow-inner mb-6">
                                        <p className="font-semibold text-sm text-gray-600">
                                            شناسه کاربری شما: <span className="break-all font-mono text-purple-800">{userId}</span>
                                        </p>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300"
                                            disabled={loading}
                                        >
                                            خروج
                                        </button>
                                    </div>

                                    {/* Form to Add/Edit Novels */}
                                    <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-lg shadow-md space-y-4">
                                        <h2 className="text-2xl font-bold text-purple-600 text-center mb-4">
                                            {editingNovelId ? 'ویرایش رمان' : 'افزودن رمان جدید'}
                                        </h2>
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">عنوان رمان:</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={newNovel.title}
                                                onChange={handleChange}
                                                placeholder="نام رمان را وارد کنید"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">نویسنده:</label>
                                            <input
                                                type="text"
                                                id="author"
                                                name="author"
                                                value={newNovel.author}
                                                onChange={handleChange}
                                                placeholder="نام نویسنده را وارد کنید"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">ژانر:</label>
                                            <input
                                                type="text"
                                                id="genre"
                                                name="genre"
                                                value={newNovel.genre}
                                                onChange={handleChange}
                                                placeholder="مثال: فانتزی، علمی تخیلی"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">امتیاز (۱-۱۰):</label>
                                            <input
                                                type="number"
                                                id="rating"
                                                name="rating"
                                                value={newNovel.rating}
                                                onChange={handleChange}
                                                min="1"
                                                max="10"
                                                placeholder="امتیاز خود را از ۱ تا ۱۰ وارد کنید"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                            />
                                        </div>
                                        {/* Input fields for chapters read and total chapters */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="chaptersRead" className="block text-sm font-medium text-gray-700 mb-1">فصل‌های خوانده شده:</label>
                                                <input
                                                    type="number"
                                                    id="chaptersRead"
                                                    name="chaptersRead"
                                                    value={newNovel.chaptersRead}
                                                    onChange={handleChange}
                                                    min="0"
                                                    placeholder="تعداد فصل‌های خوانده شده"
                                                    className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="totalChapters" className="block text-sm font-medium text-gray-700 mb-1">کل فصل‌ها:</label>
                                                <input
                                                    type="number"
                                                    id="totalChapters"
                                                    name="totalChapters"
                                                    value={newNovel.totalChapters}
                                                    onChange={handleChange}
                                                    min="1"
                                                    placeholder="تعداد کل فصل‌ها"
                                                    className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                />
                                            </div>
                                        </div>
                                        {/* Checkbox for Favorite and Dropdown for Reading Status */}
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="isFavorite"
                                                    name="isFavorite"
                                                    checked={newNovel.isFavorite}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="isFavorite" className="ml-2 text-sm font-medium text-gray-700">مورد علاقه</label>
                                            </div>
                                            <div>
                                                <label htmlFor="readingStatus" className="block text-sm font-medium text-gray-700 mb-1">وضعیت مطالعه:</label>
                                                <select
                                                    id="readingStatus"
                                                    name="readingStatus"
                                                    value={newNovel.readingStatus}
                                                    onChange={handleChange}
                                                    className="px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                                >
                                                    <option value="not_started">هنوز شروع نشده</option>
                                                    <option value="reading">در حال مطالعه</option>
                                                    <option value="publishing">در حال انتشار</option>
                                                    <option value="completed">تکمیل شده</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">یادداشت‌ها:</label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={newNovel.notes}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="یادداشت‌های خود را درباره رمان بنویسید"
                                                className="w-full px-4 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                                                disabled={loading}
                                            >
                                                {editingNovelId ? 'ذخیره تغییرات' : 'افزودن رمان'}
                                            </button>
                                            {editingNovelId && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
                                                    disabled={loading}
                                                >
                                                    لغو
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    {/* Search and Filter Section */}
                                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                                        <h2 className="text-2xl font-bold text-purple-600 text-center mb-4">
                                            جستجو و فیلتر
                                        </h2>
                                        <input
                                            type="text"
                                            placeholder="جستجو بر اساس عنوان، نویسنده یا یادداشت‌ها..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Genre Filter */}
                                            <div>
                                                <label htmlFor="filterGenre" className="block text-sm font-medium text-gray-700 mb-1">فیلتر ژانر:</label>
                                                <select
                                                    id="filterGenre"
                                                    value={filterGenre}
                                                    onChange={(e) => setFilterGenre(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                >
                                                    {uniqueGenres.map(genre => (
                                                        <option key={genre} value={genre}>{genre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Reading Status Filter */}
                                            <div>
                                                <label htmlFor="filterReadingStatus" className="block text-sm font-medium text-gray-700 mb-1">فیلتر وضعیت مطالعه:</label>
                                                <select
                                                    id="filterReadingStatus"
                                                    value={filterReadingStatus}
                                                    onChange={(e) => setFilterReadingStatus(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                                >
                                                    <option value="همه">همه</option>
                                                    <option value="completed">تکمیل شده</option>
                                                    <option value="reading">در حال مطالعه</option>
                                                    <option value="publishing">در حال انتشار</option>
                                                    <option value="not_started">هنوز شروع نشده</option>
                                                </select>
                                            </div>
                                            {/* Show Favorites Toggle */}
                                            <div className="flex items-end pb-1">
                                                <input
                                                    type="checkbox"
                                                    id="showFavorites"
                                                    checked={showFavorites}
                                                    onChange={(e) => setShowFavorites(e.target.checked)}
                                                    className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="showFavorites" className="ml-2 text-base font-medium text-gray-700">فقط مورد علاقه</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List of Novels */}
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h2 className="text-2xl font-bold text-purple-600 text-center mb-6">
                                            رمان‌های خوانده شده شما
                                        </h2>
                                        {/* Display total number of novels */}
                                        <p className="text-center text-lg text-gray-700 mb-4">
                                            شما تاکنون <span className="font-bold text-purple-700">{filteredNovels.length}</span> رمان (از {novels.length} کل) را مشاهده می‌کنید.
                                        </p>
                                        {filteredNovels.length === 0 && !loading && (
                                            <p className="text-center text-gray-500 text-lg">رمانی با این فیلترها یافت نشد.</p>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {filteredNovels.map(novel => (
                                                <div key={novel.id} className="bg-purple-50 p-5 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition duration-200 relative">
                                                    {/* Favorite and Reading Status Icons */}
                                                    <div className="absolute top-3 left-3 flex space-x-2 rtl:space-x-reverse">
                                                        <button
                                                            onClick={() => toggleFavorite(novel.id, novel.isFavorite)}
                                                            className={`text-xl ${novel.isFavorite ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'} transition duration-200`}
                                                            title={novel.isFavorite ? 'حذف از مورد علاقه' : 'افزودن به مورد علاقه'}
                                                        >
                                                            <i className="fas fa-heart"></i>
                                                        </button>
                                                        {novel.readingStatus === 'completed' && (
                                                            <span className="text-xl text-green-500" title="تکمیل شده">
                                                                <i className="fas fa-check-circle"></i>
                                                            </span>
                                                        )}
                                                        {novel.readingStatus === 'publishing' && (
                                                            <span className="text-xl text-blue-500" title="در حال انتشار">
                                                                <i className="fas fa-sync-alt"></i> {/* Icon for publishing/in progress */}
                                                            </span>
                                                        )}
                                                        {novel.readingStatus === 'reading' && (
                                                            <span className="text-xl text-yellow-500" title="در حال مطالعه">
                                                                <i className="fas fa-book-open"></i> {/* Icon for reading */}
                                                            </span>
                                                        )}
                                                        {novel.readingStatus === 'not_started' && (
                                                            <span className="text-xl text-gray-500" title="هنوز شروع نشده">
                                                                <i className="fas fa-hourglass-start"></i> {/* Icon for not started */}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-xl font-semibold text-purple-800 mb-2 text-right">{novel.title}</h3>
                                                    <p className="text-gray-700 mb-1 text-right">
                                                        <span className="font-medium">نویسنده:</span> {novel.author}
                                                    </p>
                                                    {novel.genre && (
                                                        <p className="text-gray-700 mb-1 text-right">
                                                            <span className="font-medium">ژانر:</span> {novel.genre}
                                                        </p>
                                                    )}
                                                    {novel.rating && (
                                                        <p className="text-gray-700 mb-1 text-right">
                                                            <span className="font-medium">امتیاز:</span> {novel.rating} / ۱۰
                                                        </p>
                                                    )}
                                                    {/* Display chapters read information */}
                                                    {(novel.chaptersRead && novel.totalChapters) && (
                                                        <p className="text-gray-700 mb-1 text-right">
                                                            <span className="font-medium">فصل‌های خوانده شده:</span> {novel.chaptersRead} از {novel.totalChapters}
                                                        </p>
                                                    )}
                                                    <p className="text-gray-700 mb-1 text-right">
                                                        <span className="font-medium">وضعیت:</span>
                                                        {novel.readingStatus === 'not_started' && ' هنوز شروع نشده'}
                                                        {novel.readingStatus === 'reading' && ' در حال مطالعه'}
                                                        {novel.readingStatus === 'publishing' && ' در حال انتشار'}
                                                        {novel.readingStatus === 'completed' && ' تکمیل شده'}
                                                    </p>
                                                    {novel.notes && (
                                                        <p className="text-gray-700 text-sm italic mt-2 border-t border-purple-200 pt-2 text-right">
                                                            <span className="font-medium not-italic">یادداشت‌ها:</span> {novel.notes}
                                                        </p>
                                                    )}
                                                    <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4">
                                                        <button
                                                            onClick={() => handleEditClick(novel)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm shadow-md transform hover:scale-105 transition duration-300"
                                                        >
                                                            ویرایش
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(novel.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm shadow-md transform hover:scale-105 transition duration-300"
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            );
                        }
                    })()}

                    {/* Delete Confirmation Modal */}
                    {confirmDeleteId && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">تایید حذف</h3>
                                <p className="text-gray-600 mb-6">آیا مطمئن هستید که می‌خواهید این رمان را حذف کنید؟</p>
                                <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300"
                                        disabled={loading}
                                    >
                                        بله، حذف کن
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300"
                                        disabled={loading}
                                    >
                                        لغو
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message Modal */}
                    {errorMessage && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                                <h3 className="text-xl font-bold text-red-700 mb-4">خطا</h3>
                                <p className="text-gray-600 mb-6">{errorMessage}</p>
                                <button
                                    onClick={() => setErrorMessage(null)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300"
                                >
                                    باشه
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Render the React App
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
