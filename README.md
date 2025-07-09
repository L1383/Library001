# Library001
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
            signOut,
            sendPasswordResetEmail          // New import for password reset
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
        console.log("Firebase Config:", firebaseConfig); // For debugging purposes

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
        window.sendPasswordResetEmail = sendPasswordResetEmail;             // Make password reset function global
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
                genres: [], // Genres are now an array of strings
                rating: '',
                notes: '',
                chaptersRead: '',
                totalChapters: '',
                isFavorite: false, // Field for favorite status
                readingStatus: 'not_started', // New field for reading status: 'not_started', 'reading', 'publishing', 'completed'
                links: [] // New field for multiple external links (array of strings)
            });
            const [currentGenreInput, setCurrentGenreInput] = React.useState(''); // For the genre input field (before converting to tags)
            const [currentLinkInput, setCurrentLinkInput] = React.useState(''); // For the link input field (before converting to tags)


            const [editingNovelId, setEditingNovelId] = React.useState(null); // ID of the novel being edited
            const [confirmDeleteId, setConfirmDeleteId] = React.useState(null); // ID of the novel pending deletion confirmation
            const [loading, setLoading] = React.useState(true); // Loading state
            const [dbInstance, setDbInstance] = React.useState(null); // Firestore instance
            const [authInstance, setAuthInstance] = React.useState(null); // Firebase Auth instance
            const [userId, setUserId] = React.useState(null); // Current user ID
            const [isAuthReady, setIsAuthReady] = React.useState(false); // Flag to check if Firebase Auth is ready
            const [errorMessage, setErrorMessage] = React.useState(null); // State for general error messages
            const [authErrorMessage, setAuthErrorMessage] = React.useState(null); // State for authentication specific error messages
            const [passwordResetMessage, setPasswordResetMessage] = React.useState(null); // State for password reset messages

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
                    const novelCollectionRef = window.collection(dbInstance, `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`);
                    const q = window.query(novelCollectionRef);

                    const unsubscribe = window.onSnapshot(q, (snapshot) => {
                        const fetchedNovels = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            // Ensure genres is an array, even if stored as a single string or undefined
                            genres: Array.isArray(doc.data().genres) ? doc.data().genres : (doc.data().genre ? [doc.data().genre] : []),
                            // Ensure links is an array, even if stored as a single string or undefined
                            links: Array.isArray(doc.data().links) ? doc.data().links : (doc.data().link ? [doc.data().link] : [])
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

            // Handle input changes for general form fields
            const handleChange = (e) => {
                const { name, value, type, checked } = e.target;
                setNewNovel(prev => ({
                    ...prev,
                    [name]: type === 'checkbox' ? checked : value
                }));
            };

            // Handle adding genre tags from the input field
            const handleAddGenreTag = (e) => {
                // Add tag on Enter key press or comma input
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault(); // Prevent form submission
                    const input = currentGenreInput.trim();
                    if (input) {
                        // Split by comma and trim each part, filter out empty strings
                        const newTags = input.split(',').map(tag => tag.trim()).filter(Boolean);
                        setNewNovel(prev => {
                            // Add new tags to existing genres, ensuring uniqueness
                            const updatedGenres = [...new Set([...prev.genres, ...newTags])];
                            return { ...prev, genres: updatedGenres };
                        });
                        setCurrentGenreInput(''); // Clear the input field
                    }
                }
            };

            // Handle removing a genre tag
            const handleRemoveGenreTag = (genreToRemove) => {
                setNewNovel(prev => ({
                    ...prev,
                    genres: prev.genres.filter(genre => genre !== genreToRemove)
                }));
            };

            // Handle adding link tags from the input field
            const handleAddLinkTag = (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const input = currentLinkInput.trim();
                    if (input) {
                        const newLinks = input.split(',').map(link => link.trim()).filter(Boolean);
                        setNewNovel(prev => {
                            const updatedLinks = [...new Set([...prev.links, ...newLinks])];
                            return { ...prev, links: updatedLinks };
                        });
                        setCurrentLinkInput('');
                    }
                }
            };

            // Handle removing a link tag
            const handleRemoveLinkTag = (linkToRemove) => {
                setNewNovel(prev => ({
                    ...prev,
                    links: prev.links.filter(link => link !== linkToRemove)
                }));
            };

            // Handle authentication form submission (login/signup)
            const handleAuthSubmit = async (e) => {
                e.preventDefault();
                setAuthErrorMessage(null); // Clear previous auth errors
                setPasswordResetMessage(null); // Clear password reset messages
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
                        case 'auth/invalid-credential':
                            userFriendlyMessage = "ایمیل یا رمز عبور اشتباه است. لطفاً دوباره بررسی کنید.";
                            break;
                        case 'auth/network-request-failed':
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

            // Handle password reset request
            const handlePasswordReset = async () => {
                setAuthErrorMessage(null); // Clear previous auth errors
                setPasswordResetMessage(null); // Clear previous password reset messages
                if (!email) {
                    setAuthErrorMessage("لطفاً ایمیل خود را برای بازیابی رمز عبور وارد کنید.");
                    return;
                }
                setLoading(true);
                try {
                    await window.sendPasswordResetEmail(authInstance, email);
                    setPasswordResetMessage("ایمیل بازیابی رمز عبور به آدرس " + email + " ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.");
                    setEmail(''); // Clear email field after sending
                } catch (error) {
                    console.error("خطا در ارسال ایمیل بازیابی رمز عبور:", error);
                    let userFriendlyMessage = "خطا در ارسال ایمیل بازیابی رمز عبور. لطفاً دوباره تلاش کنید.";
                    switch (error.code) {
                        case 'auth/invalid-email':
                            userFriendlyMessage = "ایمیل نامعتبر است.";
                            break;
                        case 'auth/user-not-found':
                            userFriendlyMessage = "کاربری با این ایمیل یافت نشد.";
                            break;
                        case 'auth/network-request-failed':
                            userFriendlyMessage = "خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.";
                            break;
                        default:
                            userFriendlyMessage = "خطای ناشناخته در بازیابی رمز عبور: " + error.message;
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

                // Final check for any remaining text in currentGenreInput and add as tags
                const genresToSave = [...newNovel.genres];
                if (currentGenreInput.trim() !== '') {
                    const newTags = currentGenreInput.split(',').map(tag => tag.trim()).filter(Boolean);
                    genresToSave.push(...newTags);
                }
                const uniqueGenres = [...new Set(genresToSave)].filter(Boolean); // Ensure uniqueness and remove empty strings

                // Final check for any remaining text in currentLinkInput and add as tags
                const linksToSave = [...newNovel.links];
                if (currentLinkInput.trim() !== '') {
                    const newLinks = currentLinkInput.split(',').map(link => link.trim()).filter(Boolean);
                    linksToSave.push(...newLinks);
                }
                const uniqueLinks = [...new Set(linksToSave)].filter(Boolean); // Ensure uniqueness and remove empty strings

                setLoading(true);
                try {
                    const collectionPath = `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`;
                    const novelData = { ...newNovel, genres: uniqueGenres, links: uniqueLinks }; 

                    if (editingNovelId) {
                        const novelDocRef = window.doc(dbInstance, collectionPath, editingNovelId);
                        await window.updateDoc(novelDocRef, novelData);
                        setEditingNovelId(null); // Exit edit mode
                    } else {
                        await window.addDoc(window.collection(dbInstance, collectionPath), novelData);
                    }
                    // Clear the form and reset genre/link input
                    setNewNovel({ title: '', author: '', genres: [], rating: '', notes: '', chaptersRead: '', totalChapters: '', isFavorite: false, readingStatus: 'not_started', links: [] }); 
                    setCurrentGenreInput(''); // Clear the current genre input field
                    setCurrentLinkInput(''); // Clear the current link input field
                } catch (error) {
                    console.error("خطا در افزودن/به‌روزرسانی رمان:", error);
                    if (error.code === 'not-found' && editingNovelId) {
                        setErrorMessage("خطا: رمان مورد نظر برای ویرایش یافت نشد. ممکن است توسط شخص دیگری یا از طریق کنسول حذف شده باشد.");
                        setEditingNovelId(null); // Reset editing state
                        setNewNovel({ title: '', author: '', genres: [], rating: '', notes: '', chaptersRead: '', totalChapters: '', isFavorite: false, readingStatus: 'not_started', links: [] }); 
                        setCurrentGenreInput('');
                        setCurrentLinkInput('');
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
                    genres: novel.genres || [], // Ensure genres is an array
                    rating: novel.rating || '',
                    notes: novel.notes,
                    chaptersRead: novel.chaptersRead || '',
                    totalChapters: novel.totalChapters || '',
                    isFavorite: novel.isFavorite || false,
                    readingStatus: novel.readingStatus || 'not_started', // Populate new field, default to 'not_started'
                    links: novel.links || [] // Populate links field (ensure it's an array)
                });
                setCurrentGenreInput(''); // Clear the genre input field when editing
                setCurrentLinkInput(''); // Clear the link input field when editing
                window.scrollTo(0, 0); // Scroll to the top of the page
            };

            // Cancel editing and clear the form
            const handleCancelEdit = () => {
                setEditingNovelId(null);
                setNewNovel({ title: '', author: '', genres: [], rating: '', notes: '', chaptersRead: '', totalChapters: '', isFavorite: false, readingStatus: 'not_started', links: [] }); 
                setCurrentGenreInput(''); // Clear the genre input field
                setCurrentLinkInput(''); // Clear the link input field
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
                    const collectionPath = `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`;
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
                    const novelDocRef = window.doc(dbInstance, `artifacts/${window.firebaseConfig.appId}/users/${userId}/read_novels`, novelId);
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
                // Search filter (now includes searching within genre array and links array)
                const matchesSearch = novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      novel.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      novel.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      (novel.genres && novel.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                                      (novel.links && novel.links.some(l => l.toLowerCase().includes(searchTerm.toLowerCase())));


                // Genre filter (checks if the novel's genres array includes the selected filter genre)
                const matchesGenre = filterGenre === 'همه' || (novel.genres && novel.genres.some(g => g.toLowerCase() === filterGenre.toLowerCase()));

                // Reading Status filter
                const matchesReadingStatus = filterReadingStatus === 'همه' || novel.readingStatus === filterReadingStatus;

                // Favorite filter
                const matchesFavorite = !showFavorites || novel.isFavorite;

                return matchesSearch && matchesGenre && matchesReadingStatus && matchesFavorite;
            });

            // Extract unique genres for the filter dropdown
            // This will now collect all unique genres from all novels, including custom ones
            const allAvailableGenresForFilter = ['همه', ...new Set(novels.flatMap(novel => novel.genres).filter(Boolean))];
            // Sort the filter genres alphabetically, keeping 'همه' at the beginning
            allAvailableGenresForFilter.sort((a, b) => {
                if (a === 'همه') return -1;
                if (b === 'همه') return 1;
                return a.localeCompare(b);
            });


            // Render the application UI
            return (
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-4 sm:p-8 space-y-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-purple-700 mb-6 sm:mb-8">
                        <i className="fas fa-book-reader mr-2 sm:mr-3"></i> رمان‌هایی که خوانده‌ام
                    </h1>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-purple-500"></div>
                            <p className="ml-3 sm:ml-4 text-base sm:text-lg text-purple-600">در حال بارگذاری...</p>
                        </div>
                    )}

                    {/* Conditional rendering based on authentication state */}
                    {(() => {
                        if (!isAuthReady) {
                            return <div className="text-center text-gray-500 text-base sm:text-lg">در حال آماده‌سازی احراز هویت...</div>;
                        } else if (!userId) {
                            return (
                                /* Authentication Forms (Login/Signup) */
                                <div className="bg-purple-50 p-4 sm:p-6 rounded-lg shadow-md space-y-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-purple-600 text-center mb-4">
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
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
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
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                                required
                                            />
                                        </div>
                                        {authErrorMessage && (
                                            <p className="text-red-600 text-xs sm:text-sm text-center">{authErrorMessage}</p>
                                        )}
                                        {passwordResetMessage && (
                                            <p className="text-green-600 text-xs sm:text-sm text-center">{passwordResetMessage}</p>
                                        )}
                                        <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 sm:px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 text-sm sm:text-base"
                                                disabled={loading}
                                            >
                                                {isLoginMode ? 'ورود' : 'ثبت‌نام'}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={() => setIsLoginMode(!isLoginMode)}
                                            className="text-purple-600 hover:text-purple-800 font-semibold transition duration-200 text-sm sm:text-base"
                                        >
                                            {isLoginMode ? 'حساب کاربری ندارید؟ ثبت‌نام کنید.' : 'قبلاً حساب کاربری دارید؟ وارد شوید.'}
                                        </button>
                                        {isLoginMode && (
                                            <button
                                                onClick={handlePasswordReset}
                                                className="block w-full mt-2 text-xs sm:text-sm text-purple-500 hover:text-purple-700 font-semibold transition duration-200"
                                                disabled={loading}
                                            >
                                                رمز عبور خود را فراموش کرده‌اید؟
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                /* Main Application Content */
                                <>
                                    {/* Display User ID and Logout Button */}
                                    <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg shadow-inner mb-6">
                                        <p className="font-semibold text-xs sm:text-sm text-gray-600">
                                            شناسه کاربری شما: <span className="break-all font-mono text-purple-800">{userId}</span>
                                        </p>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 sm:px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 text-xs sm:text-sm"
                                            disabled={loading}
                                        >
                                            خروج
                                        </button>
                                    </div>

                                    {/* Form to Add/Edit Novels */}
                                    <form onSubmit={handleSubmit} className="bg-purple-50 p-4 sm:p-6 rounded-lg shadow-md space-y-4">
                                        <h2 className="text-xl sm:text-2xl font-bold text-purple-600 text-center mb-4">
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
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
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
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="genreInput" className="block text-sm font-medium text-gray-700 mb-1">ژانرها (با کاما جدا کنید):</label>
                                            <input
                                                type="text"
                                                id="genreInput"
                                                value={currentGenreInput}
                                                onChange={(e) => setCurrentGenreInput(e.target.value)}
                                                onKeyDown={handleAddGenreTag}
                                                placeholder="مثال: فانتزی، علمی تخیلی، درام"
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {newNovel.genres.map((genre, index) => (
                                                    <span key={index} className="bg-purple-200 text-purple-800 text-xs sm:text-sm font-medium px-2 py-1 rounded-full flex items-center">
                                                        {genre}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveGenreTag(genre)}
                                                            className="ml-1 sm:ml-2 text-purple-600 hover:text-purple-900 focus:outline-none text-sm"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
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
                                                step="0.5" 
                                                placeholder="امتیاز خود را از ۱ تا ۱۰ وارد کنید"
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                            />
                                        </div>
                                        {/* Input fields for chapters read and total chapters */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
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
                                                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                                />
                                            </div>
                                        </div>
                                        {/* Checkbox for Favorite and Dropdown for Reading Status */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
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
                                                    className="px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                                >
                                                    <option value="not_started">هنوز شروع نشده</option>
                                                    <option value="reading">در حال مطالعه</option>
                                                    <option value="publishing">در حال انتشار</option>
                                                    <option value="completed">تکمیل شده</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="linkInput" className="block text-sm font-medium text-gray-700 mb-1">لینک‌ها (با کاما جدا کنید، اختیاری):</label>
                                            <input
                                                type="text"
                                                id="linkInput"
                                                value={currentLinkInput}
                                                onChange={(e) => setCurrentLinkInput(e.target.value)}
                                                onKeyDown={handleAddLinkTag}
                                                placeholder="مثال: https://example.com/novel, https://another.link"
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {newNovel.links.map((link, index) => (
                                                    <span key={index} className="bg-blue-200 text-blue-800 text-xs sm:text-sm font-medium px-2 py-1 rounded-full flex items-center">
                                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline break-all">{link}</a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLinkTag(link)}
                                                            className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-900 focus:outline-none text-sm"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ))}
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
                                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 sm:px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 text-sm sm:text-base"
                                                disabled={loading}
                                            >
                                                {editingNovelId ? 'ذخیره تغییرات' : 'افزودن رمان'}
                                            </button>
                                            {editingNovelId && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 sm:px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 text-sm sm:text-base"
                                                    disabled={loading}
                                                >
                                                    لغو
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    {/* Search and Filter Section */}
                                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4">
                                        <h2 className="text-xl sm:text-2xl font-bold text-purple-600 text-center mb-4">
                                            جستجو و فیلتر
                                        </h2>
                                        <input
                                            type="text"
                                            placeholder="جستجو بر اساس عنوان، نویسنده یا یادداشت‌ها..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Genre Filter */}
                                            <div>
                                                <label htmlFor="filterGenre" className="block text-sm font-medium text-gray-700 mb-1">فیلتر ژانر:</label>
                                                <select
                                                    id="filterGenre"
                                                    value={filterGenre}
                                                    onChange={(e) => setFilterGenre(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                                >
                                                    <option value="همه">همه</option>
                                                    {allAvailableGenresForFilter.filter(g => g !== 'همه').map(genre => (
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
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
                                                <label htmlFor="showFavorites" className="ml-2 text-sm sm:text-base font-medium text-gray-700">فقط مورد علاقه</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List of Novels */}
                                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                                        <h2 className="text-xl sm:text-2xl font-bold text-purple-600 text-center mb-6">
                                            رمان‌های خوانده شده شما
                                        </h2>
                                        {/* Display total number of novels */}
                                        <p className="text-center text-base sm:text-lg text-gray-700 mb-4">
                                            شما تاکنون <span className="font-bold text-purple-700">{filteredNovels.length}</span> رمان (از {novels.length} کل) را مشاهده می‌کنید.
                                        </p>
                                        {filteredNovels.length === 0 && !loading && (
                                            <p className="text-center text-gray-500 text-base sm:text-lg">رمانی با این فیلترها یافت نشد.</p>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {filteredNovels.map(novel => (
                                                <div 
                                                    key={novel.id} 
                                                    className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition duration-200 relative flex flex-col items-end"
                                                >
                                                    {/* Favorite and Reading Status Icons */}
                                                    <div className="absolute top-3 left-3 flex space-x-2 rtl:space-x-reverse">
                                                        <button
                                                            onClick={() => toggleFavorite(novel.id, novel.isFavorite)}
                                                            className={`text-lg sm:text-xl ${novel.isFavorite ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'} transition duration-200`}
                                                            title={novel.isFavorite ? 'حذف از مورد علاقه' : 'افزودن به مورد علاقه'}
                                                        >
                                                            <i className="fas fa-heart"></i>
                                                        </button>
                                                        {novel.readingStatus === 'completed' && (
                                                            <span className="text-lg sm:text-xl text-green-500" title="تکمیل شده">
                                                                <i className="fas fa-check-circle"></i>
                                                            </span>
                                                        )}
                                                        {novel.readingStatus === 'publishing' && (
                                                            <span className="text-lg sm:text-xl text-blue-500" title="در حال انتشار">
                                                                <i className="fas fa-sync-alt"></i> {/* Icon for publishing/in progress */}
                                                            </span>
                                                        )}
                                                        {novel.readingStatus === 'reading' && (
                                                            <span className="text-lg sm:text-xl text-yellow-500" title="در حال مطالعه">
                                                                <i className="fas fa-book-open"></i> {/* Icon for reading */}
                                                            </span>
                                                        )}
                                                        {novel.readingStatus === 'not_started' && (
                                                            <span className="text-lg sm:text-xl text-gray-500" title="هنوز شروع نشده">
                                                                <i className="fas fa-hourglass-start"></i> {/* Icon for not started */}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg sm:text-xl font-semibold text-purple-800 mb-2 text-right w-full">{novel.title}</h3>
                                                    <p className="text-sm sm:text-base text-gray-700 mb-1 text-right w-full">
                                                        <span className="font-medium">نویسنده:</span> {novel.author}
                                                    </p>
                                                    {novel.genres && novel.genres.length > 0 && ( // Display all genres joined by comma
                                                        <p className="text-sm sm:text-base text-gray-700 mb-1 text-right w-full">
                                                            <span className="font-medium">ژانر:</span> {novel.genres.join(', ')}
                                                        </p>
                                                    )}
                                                    {novel.rating && (
                                                        <p className="text-sm sm:text-base text-gray-700 mb-1 text-right w-full">
                                                            <span className="font-medium">امتیاز:</span> {novel.rating} / ۱۰
                                                        </p>
                                                    )}
                                                    {/* Display chapters read information */}
                                                    {(novel.chaptersRead && novel.totalChapters) && (
                                                        <p className="text-sm sm:text-base text-gray-700 mb-1 text-right w-full">
                                                            <span className="font-medium">فصل‌های خوانده شده:</span> {novel.chaptersRead} از {novel.totalChapters}
                                                        </p>
                                                    )}
                                                    <p className="text-sm sm:text-base text-gray-700 mb-1 text-right w-full">
                                                        <span className="font-medium">وضعیت:</span>
                                                        {novel.readingStatus === 'not_started' && ' هنوز شروع نشده'}
                                                        {novel.readingStatus === 'reading' && ' در حال مطالعه'}
                                                        {novel.readingStatus === 'publishing' && ' در حال انتشار'}
                                                        {novel.readingStatus === 'completed' && ' تکمیل شده'}
                                                    </p>
                                                    {novel.links && novel.links.length > 0 && ( // Display all links
                                                        <div className="text-gray-700 mb-1 text-right w-full">
                                                            <span className="font-medium">لینک‌ها:</span> 
                                                            <div className="flex flex-wrap gap-1 mt-1 justify-end">
                                                                {novel.links.map((link, index) => (
                                                                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-600 hover:underline break-all">
                                                                        {link}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {novel.notes && (
                                                        <p className="text-xs sm:text-sm italic mt-2 border-t border-purple-200 pt-2 text-right w-full">
                                                            <span className="font-medium not-italic">یادداشت‌ها:</span> {novel.notes}
                                                        </p>
                                                    )}
                                                    <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4 w-full">
                                                        <button
                                                            onClick={() => handleEditClick(novel)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-xs sm:text-sm shadow-md transform hover:scale-105 transition duration-300"
                                                        >
                                                            ویرایش
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(novel.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-xs sm:text-sm shadow-md transform hover:scale-105 transition duration-300"
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
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">تایید حذف</h3>
                                <p className="text-sm sm:text-base text-gray-600 mb-6">آیا مطمئن هستید که می‌خواهید این رمان را حذف کنید؟</p>
                                <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300 text-sm sm:text-base"
                                        disabled={loading}
                                    >
                                        بله، حذف کن
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300 text-sm sm:text-base"
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
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                                <h3 className="text-xl sm:text-2xl font-bold text-red-700 mb-4">خطا</h3>
                                {errorMessage.includes("Firestore backend") || errorMessage.includes("Internet connection") ? (
                                    <p className="text-gray-600 mb-6">
                                        به نظر می‌رسد مشکلی در اتصال اینترنت شما وجود دارد یا سرور فایربیس در دسترس نیست.
                                        لطفاً اتصال اینترنت خود را بررسی کرده و دوباره امتحان کنید.
                                    </p>
                                ) : (
                                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                                )}
                                <button
                                    onClick={() => setErrorMessage(null)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition duration-300 text-sm sm:text-base"
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
