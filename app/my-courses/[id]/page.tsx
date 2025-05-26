'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CourseWithRanking } from '@/lib/types';
import { getCourseById, updateCourse } from '@/lib/actions/course.actions';
import { Navbar } from '@/components/ui/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FaThumbsUp, FaThumbsDown, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa6';
import { TbTrophy } from 'react-icons/tb';
import { Edit3 } from 'lucide-react';
import Image from 'next/image';
import { CreateCourseModal } from '@/components/ui/course-creation-modal';
import { ModuleEditor } from '@/components/ui/module-editor';

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseWithRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      setCurrentUserId(walletAddress);
    }
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError('Invalid course ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const courseData = await getCourseById(id);
        
        if (!courseData) {
          setError('Course not found');
          return;
        }

        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Verify course ownership
  useEffect(() => {
    if (course && currentUserId && course.creator_id !== currentUserId) {
      router.push('/my-courses');
    }
  }, [course, currentUserId, router]);

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-500';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Advanced':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Web3':
        return 'bg-purple-500/20 text-purple-500';
      case 'AI/ML':
        return 'bg-blue-500/20 text-blue-500';
      case 'Full Stack Development':
        return 'bg-orange-500/20 text-orange-500';
      case 'Marketing':
        return 'bg-pink-500/20 text-pink-500';
      case 'Designs':
        return 'bg-teal-500/20 text-teal-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getEloScoreColor = (eloScore: number) => {
    if (eloScore >= 2000) return 'text-yellow-500';
    if (eloScore >= 1800) return 'text-gray-400';
    if (eloScore >= 1600) return 'text-amber-600';
    return 'text-white/60';
  };

  const handleToggleVisibility = async () => {
    if (!course) return;

    try {
      const result = await updateCourse({
        courseId: course._id,
        name: course.name,
        description: course.description,
        background: course.background,
        creator_id: course.creator_id,
        isPublic: !course.isPublic,
        categories: course.categories,
        difficulty: course.difficulty,
        isOriginal: course.isOriginal,
        forkedFrom: course.forkedFrom
      });

      if (result.success) {
        setCourse(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to update course visibility:', error);
      alert('Failed to update course visibility');
    }
  };

  const handleCourseUpdated = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const updatedCourse = await getCourseById(id);
      if (updatedCourse) {
        setCourse(updatedCourse);
      } else {
        setError('Failed to refresh course data');
      }
    } catch (error) {
      console.error('Failed to refresh course:', error);
      setError('Failed to refresh course data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-white text-lg">{error || 'Course not found'}</div>
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => router.push('/my-courses')}
        >
          <FaArrowLeft className="mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8 mt-[50px]">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => router.push('/my-courses')}
          >
            <FaArrowLeft className="mr-2" />
            Back to My Courses
          </Button>

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{course.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                {!course.isPublic && (
                  <Badge className="bg-red-500/20 text-red-500">
                    Private
                  </Badge>
                )}
                {!course.isOriginal && (
                  <Badge variant="outline" className="text-white/60 border-white/20">
                    Forked
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-black/50 border-white/20 text-white hover:bg-white/10"
                onClick={handleToggleVisibility}
              >
                {course.isPublic ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Button
                variant="outline"
                className="bg-black/50 border-white/20 text-white hover:bg-white/10"
                onClick={() => setEditModalOpen(true)}
              >
                <Edit3 />
              </Button>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Image */}
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                <Image
                  src={course.background || '/default-course-bg.jpg'}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Description */}
              <Card className="bg-black/50 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                  <p className="text-white/80">
                    {course.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="bg-black/50 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {course.categories.map((category) => (
                      <Badge key={category} className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modules */}
              <Card className="bg-black/50 border-white/10">
                <CardContent className="p-6">
                  <ModuleEditor isCreator={true} courseId={course._id} onModuleChange={handleCourseUpdated} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="bg-black/50 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Course Stats</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FaThumbsUp className="text-green-500" />
                        <span className="text-white">{course.ranking?.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaThumbsDown className="text-red-500" />
                        <span className="text-white">{course.ranking?.downvotes || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TbTrophy className={getEloScoreColor(course.ranking?.eloScore || 0)} />
                      <span className={`font-semibold ${getEloScoreColor(course.ranking?.eloScore || 0)}`}>
                        {course.ranking?.eloScore || 0} ELO Score
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Info */}
              <Card className="bg-black/50 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Course Info</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60">Created</p>
                      <p className="text-white">{new Date(course.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Last Updated</p>
                      <p className="text-white">{new Date(course.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Visibility</p>
                      <p className="text-white">{course.isPublic ? 'Public' : 'Private'}</p>
                    </div>
                    {course.forkedFrom && (
                      <div>
                        <p className="text-white/60">Forked From</p>
                        <Button
                          variant="link"
                          className="text-blue-500 hover:text-blue-400 p-0"
                          onClick={() => router.push(`/courses/${course.forkedFrom}`)}
                        >
                          View Original Course
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal
      <CreateCourseModal
        currentUserId={currentUserId}
        onCourseCreated={handleCourseUpdated}
        editingCourse={course}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      >
        <div></div>
      </CreateCourseModal> */}
    </div>
  );
}
