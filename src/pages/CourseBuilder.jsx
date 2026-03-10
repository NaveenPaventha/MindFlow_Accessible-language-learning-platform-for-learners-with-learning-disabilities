import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../utils/api';
import { Save, ArrowLeft, Image as ImageIcon, Music, Type, PlusCircle, Trash2, Library, MoveUp, MoveDown } from 'lucide-react';

const CourseBuilder = () => {
    const { courseId } = useParams();
    const isNew = courseId === 'new';
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [course, setCourse] = useState({
        title: '',
        description: '',
        image: 'BookOpen',
        category: 'general',
        badge: 'free',
        totalModules: 0,
        settings: {
            requireSequential: true,
            minPassingScore: 70
        },
        lessons: [], // To hold slide data
        quiz: [] // To hold quiz questions
    });

    useEffect(() => {
        if (user && user.role !== 'teacher') {
            navigate('/');
            return;
        }
        if (!isNew) {
            loadCourse();
        }
    }, [courseId, user]);

    const loadCourse = async () => {
        try {
            const res = await courseAPI.getAll();
            const found = res.data.find(c => c.id === courseId);
            if (found) {
                setCourse({ ...found, lessons: found.lessons || [] });
            } else {
                alert("Course not found!");
                navigate('/teacher-dashboard');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        try {
            // Update totalModules to reflect lesson count in prototype
            const courseData = { ...course, totalModules: course.lessons.length > 0 ? course.lessons.length : course.totalModules };
            
            if (isNew) {
                // Mock backend requires us to simulate it via our new course endpoint, but adminAPI usually holds it. We will use courseAPI.
                await courseAPI.create({ ...courseData, id: 'course_t_' + Date.now() });
            } else {
                await courseAPI.update(courseId, courseData);
            }
            alert("Course saved successfully!");
            navigate('/teacher-dashboard');
        } catch (e) {
            alert("Failed to save course.");
        }
    };

    const addLessonSlide = () => {
        setCourse({
            ...course,
            lessons: [...course.lessons, {
                id: Date.now(),
                title: 'New Lesson',
                type: 'content',
                content: { text: '', mediaUrl: '', mediaType: 'none' }
            }]
        });
    };

    const updateLesson = (index, field, value) => {
        const newLessons = [...course.lessons];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setCourse({ ...course, lessons: newLessons });
    };

    const updateLessonContent = (index, field, value) => {
        const newLessons = [...course.lessons];
        newLessons[index].content = { ...newLessons[index].content, [field]: value };
        setCourse({ ...course, lessons: newLessons });
    };

    const deleteLesson = (index) => {
        const newLessons = [...course.lessons];
        newLessons.splice(index, 1);
        setCourse({ ...course, lessons: newLessons });
    };

    const moveLesson = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === course.lessons.length - 1)) return;
        const newLessons = [...course.lessons];
        const temp = newLessons[index];
        newLessons[index] = newLessons[index + direction];
        newLessons[index + direction] = temp;
        setCourse({ ...course, lessons: newLessons });
    };

    const addQuizQuestion = () => {
        setCourse({
            ...course,
            quiz: [...(course.quiz || []), {
                id: Date.now(),
                type: 'multiple_choice',
                question: 'New Question',
                options: ['Option A', 'Option B'],
                correctIndex: 0,
                explanation: 'Explanation here'
            }]
        });
    };

    const updateQuizQuestion = (index, field, value) => {
        const newQuiz = [...(course.quiz || [])];
        newQuiz[index] = { ...newQuiz[index], [field]: value };
        setCourse({ ...course, quiz: newQuiz });
    };

    const deleteQuizQuestion = (index) => {
        const newQuiz = [...(course.quiz || [])];
        newQuiz.splice(index, 1);
        setCourse({ ...course, quiz: newQuiz });
    };

    return (
        <Layout>
            <div className="container" style={{ padding: '30px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/teacher-dashboard')} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20}/> Back to Hub
                    </button>
                    <button onClick={handleSave} className="btn btn-primary btn-3d" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={20}/> {isNew ? 'Publish Course' : 'Save Changes'}
                    </button>
                </div>

                <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-purple)' }}><Library size={24}/> Course Settings</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Course Title *</label>
                            <input 
                                type="text" 
                                value={course.title}
                                onChange={e => setCourse({...course, title: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                placeholder="e.g., Advanced English Verbs"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Icon Name (Lucide)</label>
                            <input 
                                type="text" 
                                value={course.image}
                                onChange={e => setCourse({...course, image: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                placeholder="e.g., Star, Book, Check"
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
                            <textarea 
                                value={course.description}
                                onChange={e => setCourse({...course, description: e.target.value})}
                                rows="3"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                placeholder="What will students learn?"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category</label>
                            <select 
                                value={course.category}
                                onChange={e => setCourse({...course, category: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="general">General Learning</option>
                                <option value="dyslexia">Dyslexia Center</option>
                                <option value="speech">Speech Lab</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '30px' }}>
                            <input 
                                type="checkbox" 
                                id="req-seq" 
                                checked={course.settings.requireSequential}
                                onChange={e => setCourse({...course, settings: {...course.settings, requireSequential: e.target.checked}})}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="req-seq" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Enforce Sequential Learning (Prerequisites)</label>
                        </div>
                    </div>
                </div>

                {/* Lesson Builder Array */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Lesson Slides ({course.lessons.length})</h3>
                        <button onClick={addLessonSlide} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}>
                            <PlusCircle size={18}/> Add Slide
                        </button>
                    </div>

                    {course.lessons.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface-hover)', borderRadius: '15px', border: '2px dashed var(--border-color)' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No lessons added yet. Click "Add Slide" to begin authoring content.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {course.lessons.map((lesson, index) => (
                                <div key={lesson.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <div style={{ background: 'var(--surface-elevated)', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ background: 'var(--primary-purple)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>{index + 1}</span>
                                            <input 
                                                type="text" 
                                                value={lesson.title} 
                                                onChange={e => updateLesson(index, 'title', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none', borderBottom: '1px solid transparent' }}
                                                onFocus={e => e.target.style.borderBottom = '1px dashed var(--primary-purple)'}
                                                onBlur={e => e.target.style.borderBottom = '1px solid transparent'}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => moveLesson(index, -1)} disabled={index === 0} className="btn btn-icon btn-sm" style={{ opacity: index === 0 ? 0.3 : 1 }}><MoveUp size={16}/></button>
                                            <button onClick={() => moveLesson(index, 1)} disabled={index === course.lessons.length - 1} className="btn btn-icon btn-sm" style={{ opacity: index === course.lessons.length - 1 ? 0.3 : 1 }}><MoveDown size={16}/></button>
                                            <button onClick={() => deleteLesson(index)} className="btn btn-icon btn-sm" style={{ color: 'var(--error-color)' }}><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}><Type size={16}/> Lesson Text (Markdown Support)</label>
                                            <textarea 
                                                value={lesson.content.text}
                                                onChange={e => updateLessonContent(index, 'text', e.target.value)}
                                                style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                                                placeholder="Write your lesson content here..."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Media Attachment</label>
                                            <select 
                                                value={lesson.content.mediaType}
                                                onChange={e => updateLessonContent(index, 'mediaType', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '10px' }}
                                            >
                                                <option value="none">None</option>
                                                <option value="image">Image (URL)</option>
                                                <option value="audio">Audio (URL)</option>
                                            </select>
                                            
                                            {lesson.content.mediaType !== 'none' && (
                                                <div style={{ background: 'var(--surface-hover)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                                    <input 
                                                        type="text" 
                                                        value={lesson.content.mediaUrl}
                                                        onChange={e => updateLessonContent(index, 'mediaUrl', e.target.value)}
                                                        placeholder={`Enter ${lesson.content.mediaType} URL...`}
                                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quiz Builder Array */}
                <div style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Quiz Engine ({(course.quiz || []).length} Questions)</h3>
                        <button onClick={addQuizQuestion} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--primary-orange)', color: 'var(--primary-orange)' }}>
                            <PlusCircle size={18}/> Add Question
                        </button>
                    </div>

                    {!(course.quiz && course.quiz.length > 0) ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface-hover)', borderRadius: '15px', border: '2px dashed var(--border-color)' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No quiz questions. AI will auto-generate questions based on the title if left empty.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {course.quiz.map((q, index) => (
                                <div key={q.id || index} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <div style={{ flex: 1, marginRight: '20px' }}>
                                            <input
                                                type="text"
                                                value={q.question}
                                                onChange={e => updateQuizQuestion(index, 'question', e.target.value)}
                                                style={{ width: '100%', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}
                                                placeholder="Enter Question..."
                                            />
                                        </div>
                                        <button onClick={() => deleteQuizQuestion(index)} className="btn btn-icon btn-sm" style={{ color: 'var(--error-color)' }}><Trash2 size={16}/></button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                        <select
                                            value={q.type}
                                            onChange={e => {
                                                const newType = e.target.value;
                                                const baseUpdates = { type: newType };
                                                if (newType === 'multiple_choice') {
                                                    baseUpdates.options = ['Option 1', 'Option 2'];
                                                    baseUpdates.correctIndex = 0;
                                                } else if (newType === 'voice_practice') {
                                                    baseUpdates.targetSentence = 'Say this';
                                                } else if (newType === 'written_response') {
                                                    baseUpdates.rubric = 'Keyword 1, Keyword 2';
                                                }
                                                updateQuizQuestion(index, 'type', newType);
                                                // Simplified state merge for prototype
                                                const currentQ = [...course.quiz];
                                                currentQ[index] = { ...currentQ[index], ...baseUpdates };
                                                setCourse({...course, quiz: currentQ});
                                            }}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="multiple_choice">Multiple Choice</option>
                                            <option value="voice_practice">Voice Reading Practice</option>
                                            <option value="written_response">Written Response (AI Evaluated)</option>
                                        </select>
                                    </div>

                                    {/* Type Specific Fields */}
                                    {q.type === 'multiple_choice' && (
                                        <div style={{ padding: '15px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>Options (Select radio to specify correct answer)</p>
                                            {q.options?.map((opt, optIdx) => (
                                                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                    <input 
                                                        type="radio" 
                                                        name={`correct_${index}`} 
                                                        checked={q.correctIndex === optIdx}
                                                        onChange={() => updateQuizQuestion(index, 'correctIndex', optIdx)}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...q.options];
                                                            newOpts[optIdx] = e.target.value;
                                                            updateQuizQuestion(index, 'options', newOpts);
                                                        }}
                                                        style={{ flex: 1, padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                                    />
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => updateQuizQuestion(index, 'options', [...(q.options || []), 'New Option'])}
                                                className="btn btn-sm btn-ghost" style={{ marginTop: '10px', fontSize: '0.8rem' }}
                                            >+ Add Option</button>
                                        </div>
                                    )}

                                    {q.type === 'voice_practice' && (
                                        <div style={{ padding: '15px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Target Sentence to Speak</label>
                                            <input 
                                                type="text" 
                                                value={q.targetSentence || ''}
                                                onChange={(e) => updateQuizQuestion(index, 'targetSentence', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                            />
                                        </div>
                                    )}

                                    {q.type === 'written_response' && (
                                        <div style={{ padding: '15px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Grading Rubric / Required Keywords (used by AI)</label>
                                            <textarea 
                                                value={q.rubric || ''}
                                                onChange={(e) => updateQuizQuestion(index, 'rubric', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', height: '60px' }}
                                                placeholder="e.g. Student must mention gravity and mass."
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CourseBuilder;
