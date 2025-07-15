import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
      </div>
      <div className="space-y-8">
        <Card className="bg-card/50 border-2 border-primary/20">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="grid gap-1.5 flex-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full sm:w-[200px]" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-8 w-20 ml-auto mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full">
          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-6 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-3/4 pt-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
