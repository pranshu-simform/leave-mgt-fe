import { Card, CardContent, CardHeader, Skeleton } from '@/components/ui'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: Readonly<TableSkeletonProps>) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="flex flex-col gap-3">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card role="status" aria-busy="true" aria-label="Loading">
      <CardHeader>
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  )
}
