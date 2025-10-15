import {
    FiMessageSquare,
    FiPaperclip,
    FiSave,
    FiRefreshCw,
    FiSettings,
} from 'react-icons/fi';

const StatusBar = () => {
    return (
        <div className="bg-white border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <span>Line 1, Col 1</span>
                </div>
                <div className="h-3 w-px bg-slate-300"></div>
                <div className="flex items-center">
                    <span>0 words</span>
                </div>
                <div className="h-3 w-px bg-slate-300"></div>
                <div className="flex items-center">
                    <span>0 characters</span>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                    <FiMessageSquare className="h-3 w-3" />
                    <span>Comment</span>
                </button>
                <div className="h-3 w-px bg-slate-300"></div>
                <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                    <FiPaperclip className="h-3 w-3" />
                    <span>Upload</span>
                </button>
                <div className="h-3 w-px bg-slate-300"></div>
                <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                    <FiSave className="h-3 w-3" />
                    <span>Save</span>
                </button>
                <div className="h-3 w-px bg-slate-300"></div>
                <div className="flex items-center space-x-1">
                    <FiRefreshCw className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Auto-save ON</span>
                </div>
                <div className="h-3 w-px bg-slate-300"></div>
                <div className="flex items-center">
                    <span>16px</span>
                </div>
                <div className="h-3 w-px bg-slate-300"></div>
                <button className="flex items-center hover:text-blue-600 transition-colors">
                    <FiSettings className="h-3 w-3 mr-1" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
};

export default StatusBar;