const SettingSidebar = ({ isOpen, toggleSidebar }) => {
  const [testTypes, setTestTypes] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('project'); // 'project', 'app', 'database', 'security'

  // Fetch data when sidebar opens
  useEffect(() => {
    if (isOpen && activeMenu === 'project') {
      fetchData();
    }
  }, [isOpen, activeMenu]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [project, testTypesResponse] = await Promise.all([
        getProjectDetails(),
        getTestTypes()
      ]);

      setProjectDetails(project);
      setTestTypes(testTypesResponse?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${type}-${text}`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sidebarVariants = {
    closed: {
      x: '100%',
      opacity: 0,
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const menuItems = [
    { id: 'project', icon: FolderOpen },
    { id: 'app', icon: Cog },
    { id: 'database', icon: Database },
    { id: 'security', icon: Shield }
  ];

  const CopyButton = ({ text, type, label }) => {
    const isCopied = copiedId === `${type}-${text}`;

    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => copyToClipboard(text, type)}
        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
        title={`Copy ${label}`}
      >
        {isCopied ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </motion.button>
    );
  };

  const renderProjectDetails = () => (
    <div className="space-y-6">
      {/* Project Information */}
      {projectDetails && (
        <motion.div
          initial="closed"
          animate="open"
          variants={itemVariants}
          transition={{ delay: 0.1 }}
          className="p-4 border border-blue-100 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"
        >
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            {projectDetails.projectName}
          </h3>
          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Project ID
              </p>
              <p className="mt-1 font-mono text-sm text-gray-700">
                {projectDetails._id}
              </p>
            </div>
            <CopyButton
              text={projectDetails._id}
              type="project"
              label="Project ID"
            />
          </div>
        </motion.div>
      )}

      {/* Test Types */}
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Test Types ({testTypes.length})
        </h3>

        <div className="space-y-3">
          {testTypes.map((testType, index) => (
            <motion.div
              key={testType._id}
              initial="closed"
              animate="open"
              variants={itemVariants}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="transition-all duration-200 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800">
                      {testType.testTypeName}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {testType.testTypeDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Test Type ID
                    </p>
                    <p className="mt-1 font-mono text-xs text-gray-700 break-all">
                      {testType._id}
                    </p>
                  </div>
                  <CopyButton
                    text={testType._id}
                    type="testType"
                    label="Test Type ID"
                  />
                </div>

                {/* Framework Badge */}
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {testType.testFramework}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {testTypes.length === 0 && !loading && (
          <div className="py-8 text-center text-gray-500">
            <p className="text-sm">No test types found</p>
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderAppPreferences = () => (
    <div className="space-y-6">
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Theme Settings */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">Theme</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input type="radio" name="theme" className="text-blue-600" defaultChecked />
              <span className="text-sm text-gray-700">Light Theme</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="theme" className="text-blue-600" />
              <span className="text-sm text-gray-700">Dark Theme</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="theme" className="text-blue-600" />
              <span className="text-sm text-gray-700">Auto (System)</span>
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        {/* Key Management */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">API Key Management</h4>
          <div className="space-y-3">
            <button className="w-full px-3 py-2 text-sm text-left text-blue-700 transition-colors rounded-md bg-blue-50 hover:bg-blue-100">
              Generate New API Key
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-gray-700 transition-colors rounded-md bg-gray-50 hover:bg-gray-100">
              View Active Keys
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-red-700 transition-colors rounded-md bg-red-50 hover:bg-red-100">
              Revoke All Keys
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Connection Settings */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">Database Connection</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Connection String
              </label>
              <div className="flex items-center mt-1 space-x-2">
                <input
                  type="password"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mongodb://localhost:27017"
                />
                <button className="px-3 py-2 text-xs text-white transition-colors bg-green-600 rounded-md hover:bg-green-700">
                  Test
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Auto-connect on startup</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">Backup & Restore</h4>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left text-blue-700 transition-colors rounded-md bg-blue-50 hover:bg-blue-100">
              Create Backup
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-green-700 transition-colors rounded-md bg-green-50 hover:bg-green-100">
              Restore from Backup
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-orange-700 transition-colors rounded-md bg-orange-50 hover:bg-orange-100">
              Schedule Auto Backup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSecurityAccess = () => (
    <div className="space-y-6">
      <motion.div
        initial="closed"
        animate="open"
        variants={itemVariants}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Access Control */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">Access Control</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Two-Factor Authentication</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Session Timeout (mins)</span>
              <input
                type="number"
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                defaultValue="30"
              />
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">User Management</h4>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left text-blue-700 transition-colors rounded-md bg-blue-50 hover:bg-blue-100">
              Invite Team Members
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-green-700 transition-colors rounded-md bg-green-50 hover:bg-green-100">
              Manage Permissions
            </button>
            <button className="w-full px-3 py-2 text-sm text-left text-yellow-700 transition-colors rounded-md bg-yellow-50 hover:bg-yellow-100">
              Audit Logs
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-medium text-gray-800">Security Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Encrypt Test Data</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="w-full px-3 py-2 text-sm text-left text-red-700 transition-colors rounded-md bg-red-50 hover:bg-red-100">
              Reset Security Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    if (loading && activeMenu === 'project') {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    switch (activeMenu) {
      case 'project':
        return renderProjectDetails();
      case 'app':
        return renderAppPreferences();
      case 'database':
        return renderDatabaseSettings();
      case 'security':
        return renderSecurityAccess();
      default:
        return renderProjectDetails();
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={toggleSidebar}
            className="fixed inset-0"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 right-0 min-h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] w-96 bg-[radial-gradient(circle_at_center,theme(colors.blue.50),theme(colors.sky.50),white)] z-50 flex flex-col mt-[65px]"
          >

            {/* Menu Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex-1 flex flex-col items-center py-3 px-2 text-xs font-medium transition-all duration-200 ${activeMenu === item.id
                          ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                        }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="leading-tight text-center">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMenu}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-center text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingSidebar;