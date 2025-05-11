import { Link, Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, User } from '@/types';
import { FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  course: Course;
  students: User[];
}

export default function CreateCertificate({ auth, course, students }: PageProps<Props>) {
  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: '',
    completion_date: '',
    achievement: '',
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    post(route('teacher.courses.certificates.store', course.id));
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Courses', href: route('teacher.courses.index') },
        { label: course.title, href: route('teacher.courses.show', course.id) },
        { label: 'Issue Certificate', href: '#' }
      ]}
    >
      <Head title="Issue New Certificate" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Certificate</CardTitle>
              <CardDescription>
                Create a new certificate for a student who completed the course "{course.title}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={data.user_id}
                    onValueChange={(value) => setData('user_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={String(student.id)}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={data.completion_date}
                    onChange={(e) => setData('completion_date', e.target.value)}
                  />
                  {errors.completion_date && <p className="text-red-500 text-sm">{errors.completion_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievement">Achievement</Label>
                  <Textarea
                    id="achievement"
                    value={data.achievement}
                    onChange={(e) => setData('achievement', e.target.value)}
                    placeholder="e.g., Excellent Performance, Outstanding Achievement"
                  />
                  {errors.achievement && <p className="text-red-500 text-sm">{errors.achievement}</p>}
                </div>

                <div className="flex justify-end space-x-2">
                  <Link href={route('teacher.courses.certificates.index', course.id)}>
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={processing}>Issue Certificate</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 