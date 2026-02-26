import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Plus, FolderInput, FileVideo, FileText, Presentation, CheckCircle, AlertCircle } from 'lucide-react';

const AdminUpload = () => {
    // Mode: 'manual' | 'bulk'
    const [uploadMode, setUploadMode] = useState('manual');

    // Manual Mode State
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: 'ai',
        level: 'Beginner',
        price: '',
        originalPrice: '',
        instructor: '',
        image: '', // URL or path
        modules: []
    });
    const [currentModule, setCurrentModule] = useState({ title: '', lessons: [] });
    const [currentLesson, setCurrentLesson] = useState({ title: '', duration: '', type: 'video', file: null, contentUrl: '' });
    const [imageFile, setImageFile] = useState(null);

    // Bulk Mode State
    const [bulkCourseData, setBulkCourseData] = useState(null);
    const [bulkFiles, setBulkFiles] = useState({}); // Map: "path/to/file" -> File Object
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: '' });

    // Shared State
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // --- SHARED HANDLERS ---

    // Upload a single file to backend
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
            };
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, formData, config);
            return data;
        } catch (error) {
            console.error('File upload error', error);
            throw error;
        }
    };

    // --- MANUAL MODE HANDLERS ---

    const handleCourseChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleLessonChange = (e) => {
        setCurrentLesson({ ...currentLesson, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setCurrentLesson({ ...currentLesson, file: e.target.files[0] });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const addLesson = () => {
        if (!currentLesson.title) {
            alert('Please provide lesson title');
            return;
        }
        if (currentLesson.type === 'video' && !currentLesson.file) {
            alert('Please select a video file');
            return;
        }
        if (currentLesson.type === 'pdf' && !currentLesson.file) {
            alert('Please select a PDF file');
            return;
        }
        if (currentLesson.type === 'ppt' && !currentLesson.file) {
            alert('Please select a PowerPoint file');
            return;
        }
        if (currentLesson.type === 'slide' && !currentLesson.contentUrl) {
            alert('Please provide the slide embed URL');
            return;
        }

        setCurrentModule({
            ...currentModule,
            lessons: [...currentModule.lessons, currentLesson]
        });
        setCurrentLesson({ title: '', duration: '', type: 'video', file: null, contentUrl: '' });
    };

    const addModule = () => {
        if (!currentModule.title || currentModule.lessons.length === 0) {
            alert('Please provide module title and at least one lesson');
            return;
        }
        setCourseData({
            ...courseData,
            modules: [...courseData.modules, currentModule]
        });
        setCurrentModule({ title: '', lessons: [] });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setMessage('');

        try {
            let imageUrl = courseData.image;
            if (imageFile) {
                imageUrl = await uploadFile(imageFile);
            }

            const modulesWithUploads = await Promise.all(courseData.modules.map(async (mod) => {
                const lessonsWithUploads = await Promise.all(mod.lessons.map(async (lesson) => {
                    if (lesson.type === 'video' && lesson.file) {
                        const videoUrl = await uploadFile(lesson.file);
                        return {
                            title: lesson.title,
                            duration: lesson.duration || '00:00',
                            videoUrl: videoUrl,
                            type: 'video'
                        };
                    } else if (lesson.type === 'pdf' && lesson.file) {
                        const fileUrl = await uploadFile(lesson.file);
                        return {
                            title: lesson.title,
                            duration: lesson.duration || '00:00',
                            videoUrl: fileUrl, // Reuse videoUrl field for file URL
                            type: 'pdf'
                        };
                    } else if (lesson.type === 'ppt' && lesson.file) {
                        const fileUrl = await uploadFile(lesson.file);
                        return {
                            title: lesson.title,
                            duration: lesson.duration || '00:00',
                            videoUrl: fileUrl,
                            type: 'ppt'
                        };
                    } else if (lesson.type === 'slide' && lesson.contentUrl) {
                        return {
                            title: lesson.title,
                            duration: lesson.duration || '00:00',
                            videoUrl: lesson.contentUrl, // Reuse videoUrl for slide URL
                            type: 'slide'
                        };
                    }
                    return lesson;
                }));
                return { ...mod, lessons: lessonsWithUploads };
            }));

            const finalCourseData = { ...courseData, modules: modulesWithUploads, image: imageUrl };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/courses`, finalCourseData);

            setMessage('Course created successfully!');
            // Reset manual form
            setCourseData({
                title: '', description: '', category: 'ai', level: 'Beginner',
                price: '', originalPrice: '', instructor: '', image: '', modules: []
            });
            setImageFile(null);
        } catch (error) {
            setMessage('Error creating course: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    // --- BULK MODE HANDLERS ---

    const handleFolderSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Reset
        setBulkCourseData(null);
        setBulkFiles({});
        setMessage('');

        // Store file references mapped by relative path
        const fileMap = {};
        files.forEach(f => fileMap[f.webkitRelativePath] = f);
        setBulkFiles(fileMap);

        // 1. Identify Root Folder (Course Title)
        // Assumption: structure is "CourseTitle/Module/File"
        // webkitRelativePath example: "Python Mastery/01-Intro/video.mp4"

        const rootFolder = files[0].webkitRelativePath.split('/')[0];

        // Structure to build
        const structure = {
            title: rootFolder,
            description: 'Uploaded via Bulk Tool. Please edit details.',
            category: 'ai',
            price: '0',
            modules: [] // List of { title: "ModName", lessons: [ { title: "FileBaseName", path: "relPath" } ] }
        };

        const modulesMap = {}; // Helper to group lessons by module

        files.forEach(file => {
            const parts = file.webkitRelativePath.split('/');
            // Expect at least: Course/Module/File (length 3)
            if (parts.length < 3) return; // Skip files in root or unknown structure

            const moduleName = parts[1];
            const fileName = parts[parts.length - 1];

            // Filter for supported files
            let type = '';
            if (fileName.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
                type = 'video';
            } else if (fileName.match(/\.pdf$/i)) {
                type = 'pdf';
            } else if (fileName.match(/\.(ppt|pptx)$/i)) {
                type = 'ppt';
            }

            if (!type) return;

            if (!modulesMap[moduleName]) {
                modulesMap[moduleName] = [];
            }

            // Clean filename for lesson title (remove extension)
            const lessonTitle = fileName.replace(/\.[^/.]+$/, "");

            modulesMap[moduleName].push({
                title: lessonTitle,
                path: file.webkitRelativePath,
                type: type
            });
        });

        // Convert map to array and sort
        Object.keys(modulesMap).sort().forEach(modTitle => {
            const lessons = modulesMap[modTitle].sort((a, b) => a.title.localeCompare(b.title));
            structure.modules.push({
                title: modTitle,
                lessons: lessons
            });
        });

        if (structure.modules.length === 0) {
            setMessage('Error: No valid module folders or video files found. Check structure: "Course/Module/Video.mp4"');
            return;
        }

        setBulkCourseData(structure);
    };

    const handleBulkSubmit = async () => {
        if (!bulkCourseData) return;
        setUploading(true);
        setBulkProgress({ current: 0, total: 100, status: 'Starting upload...' }); // simplified total
        setMessage('');

        try {
            // Need to process modules sequentially or in parallel?
            // To be safe, let's do parallel uploads for files.

            // Reconstruct the data structure adding 'videoUrl'
            const processedModules = await Promise.all(bulkCourseData.modules.map(async (mod) => {
                const processedLessons = await Promise.all(mod.lessons.map(async (lesson, lessonIdx) => {
                    const file = bulkFiles[lesson.path];
                    if (!file) return lesson; // Should not happen

                    // Update UI status
                    setBulkProgress(prev => ({
                        ...prev,
                        status: `Uploading: ${lesson.title}`
                    }));

                    const fileUrl = await uploadFile(file);

                    return {
                        title: lesson.title,
                        duration: '00:00',
                        videoUrl: fileUrl,
                        type: lesson.type
                    };
                }));
                return { ...mod, lessons: processedLessons };
            }));

            // Final Metadata
            const finalCourseData = {
                ...bulkCourseData,
                modules: processedModules,
                // Default image if missing, or we could look for 'thumbnail.jpg' in root
                image: ''
            };

            setBulkProgress({ current: 100, total: 100, status: 'Saving course data...' });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/courses`, finalCourseData);

            setMessage('Bulk Upload Successful! Course created.');
            setBulkCourseData(null);
            setBulkFiles({});

        } catch (error) {
            console.error(error);
            setMessage('Bulk Upload Failed: ' + error.message);
        } finally {
            setUploading(false);
            setBulkProgress({ current: 0, total: 0, status: '' });
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            {/* Toggle Mode */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <div style={{ background: '#fff', padding: '5px', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex' }}>
                    <button
                        onClick={() => setUploadMode('manual')}
                        style={{
                            padding: '10px 25px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s',
                            background: uploadMode === 'manual' ? 'var(--primary)' : 'transparent',
                            color: uploadMode === 'manual' ? '#fff' : '#666'
                        }}
                    >
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setUploadMode('bulk')}
                        style={{
                            padding: '10px 25px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s',
                            background: uploadMode === 'bulk' ? 'var(--primary)' : 'transparent',
                            color: uploadMode === 'bulk' ? '#fff' : '#666'
                        }}
                    >
                        <FolderInput size={16} style={{ marginBottom: '-2px', marginRight: '5px' }} />
                        Bulk Upload
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '30px' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>
                    {uploadMode === 'manual' ? 'Create New Course' : 'Bulk Course Upload'}
                </h2>

                {message && (
                    <div style={{
                        padding: '10px', marginBottom: '20px', borderRadius: '5px',
                        background: message.includes('Error') || message.includes('Failed') ? '#ffebee' : '#e8f5e9',
                        color: message.includes('Error') || message.includes('Failed') ? '#c62828' : '#2e7d32',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        {message.includes('Error') ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                        {message}
                    </div>
                )}

                {/* --- MANUAL FORM --- */}
                {uploadMode === 'manual' && (
                    <form onSubmit={handleManualSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <input className="form-control" name="title" placeholder="Course Title" value={courseData.title} onChange={handleCourseChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <input className="form-control" name="instructor" placeholder="Instructor Name" value={courseData.instructor} onChange={handleCourseChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <select className="form-control" name="category" value={courseData.category} onChange={handleCourseChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                <option value="ai">Artificial Intelligence</option>
                                <option value="robotics">Robotics</option>
                                <option value="programming">Programming</option>
                                <option value="iot">Internet of Things</option>
                            </select>
                            <select className="form-control" name="level" value={courseData.level} onChange={handleCourseChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            <input className="form-control" type="number" name="price" placeholder="Price" value={courseData.price} onChange={handleCourseChange} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                            <input className="form-control" type="number" name="originalPrice" placeholder="Original Price" value={courseData.originalPrice} onChange={handleCourseChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
                        </div>

                        <textarea className="form-control" name="description" placeholder="Course Description" value={courseData.description} onChange={handleCourseChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '20px', minHeight: '100px' }} />

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)' }}>
                                Course Thumbnail Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '5px',
                                    border: '1px solid #ddd', cursor: 'pointer'
                                }}
                            />
                        </div>

                        <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Add Modules & Lessons</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <input
                                    placeholder="Module Title (e.g., Introduction)"
                                    value={currentModule.title}
                                    onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                                />
                                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Add Lesson to Module</h4>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Content Type</label>
                                        <select
                                            name="type"
                                            value={currentLesson.type}
                                            onChange={handleLessonChange}
                                            style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd' }}
                                        >
                                            <option value="video">Video Lesson</option>
                                            <option value="pdf">PDF Document</option>
                                            <option value="ppt">PowerPoint Presentation</option>
                                            <option value="slide">Google Slides</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input placeholder="Lesson Title" name="title" value={currentLesson.title} onChange={handleLessonChange} style={{ flex: 1, padding: '8px' }} />
                                        <input placeholder="Duration (e.g. 10:00)" name="duration" value={currentLesson.duration} onChange={handleLessonChange} style={{ width: '100px', padding: '8px' }} />
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        {currentLesson.type === 'video' && (
                                            <>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Video File</label>
                                                <input type="file" accept="video/*" onChange={handleFileChange} />
                                            </>
                                        )}
                                        {currentLesson.type === 'pdf' && (
                                            <>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>PDF File</label>
                                                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                                            </>
                                        )}
                                        {currentLesson.type === 'ppt' && (
                                            <>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>PowerPoint File</label>
                                                <input type="file" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={handleFileChange} />
                                            </>
                                        )}
                                        {currentLesson.type === 'slide' && (
                                            <>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Slide Embed URL</label>
                                                <input
                                                    placeholder="Paste Google Slides Embed URL here"
                                                    name="contentUrl"
                                                    value={currentLesson.contentUrl}
                                                    onChange={handleLessonChange}
                                                    style={{ width: '100%', padding: '8px' }}
                                                />
                                                <p style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>File {'>'} Share {'>'} Publish to web {'>'} Embed</p>
                                            </>
                                        )}
                                    </div>
                                    <button type="button" onClick={addLesson} className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                                        <Plus size={12} /> Add Lesson
                                    </button>
                                    {currentModule.lessons.length > 0 && (
                                        <ul style={{ marginTop: '10px', fontSize: '12px' }}>
                                            {currentModule.lessons.map((l, idx) => (
                                                <li key={idx}>
                                                    <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>[{l.type}]</span> {l.title}
                                                    {l.file && ` (${l.file.name})`}
                                                    {l.contentUrl && ` (URl)`}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <button type="button" onClick={addModule} className="btn btn-primary" style={{ marginTop: '15px' }}>
                                    Add Module to Course
                                </button>
                            </div>
                            {courseData.modules.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4>Course Structure Preview:</h4>
                                    {courseData.modules.map((m, idx) => (
                                        <div key={idx} style={{ padding: '10px', background: '#e3f2fd', marginBottom: '5px', borderRadius: '5px' }}>
                                            <strong>{m.title}</strong> ({m.lessons.length} lessons)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-accent" disabled={uploading} style={{ width: '100%', padding: '15px', fontSize: '16px' }}>
                            {uploading ? 'Uploading...' : 'Create Course'}
                        </button>
                    </form>
                )}

                {/* --- BULK UPLOAD FORM --- */}
                {uploadMode === 'bulk' && (
                    <div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px dashed #ccc', textAlign: 'center' }}>
                            <FolderInput size={48} color="#ccc" style={{ marginBottom: '10px' }} />
                            <h3 style={{ fontSize: '18px', color: '#555' }}>Select Course Folder</h3>
                            <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                                Folder Structure should be: <br />
                                <strong>Course Name / Module Name / LessonName.mp4</strong>
                            </p>

                            <input
                                type="file"
                                id="folderInput"
                                webkitdirectory=""
                                directory=""
                                multiple
                                onChange={handleFolderSelect}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="folderInput"
                                className="btn btn-primary"
                                style={{ display: 'inline-block', cursor: 'pointer', padding: '10px 30px' }}
                            >
                                Choose Folder
                            </label>
                        </div>

                        {uploading && (
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto 10px auto' }}></div>
                                <p style={{ fontWeight: 'bold' }}>{bulkProgress.status}</p>
                            </div>
                        )}

                        {bulkCourseData && !uploading && (
                            <div style={{ marginTop: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>Preview: {bulkCourseData.title}</h3>
                                    <button
                                        onClick={handleBulkSubmit}
                                        className="btn btn-accent"
                                        style={{ padding: '8px 20px' }}
                                    >
                                        <Upload size={16} style={{ marginRight: '8px' }} />
                                        Confirm & Upload
                                    </button>
                                </div>

                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {bulkCourseData.modules.map((mod, idx) => (
                                        <div key={idx} style={{ marginBottom: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                            <div style={{ background: '#f5f5f5', padding: '10px 15px', fontWeight: 'bold', fontSize: '14px', borderBottom: '1px solid #eee' }}>
                                                {mod.title}
                                            </div>
                                            <div style={{ padding: '0 15px' }}>
                                                {mod.lessons.map((lesson, lIdx) => (
                                                    <div key={lIdx} style={{ padding: '10px 0', borderBottom: lIdx === mod.lessons.length - 1 ? 'none' : '1px solid #f9f9f9', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                                                        {lesson.type === 'video' ? <FileVideo size={14} /> :
                                                            lesson.type === 'pdf' ? <FileText size={14} /> :
                                                                <Presentation size={14} />}
                                                        {lesson.title}
                                                        <span style={{ fontSize: '10px', color: '#999', marginLeft: 'auto' }}>({lesson.type})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUpload;
