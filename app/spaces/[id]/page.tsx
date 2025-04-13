import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { spaces, userSpaces, dashboards, widgets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = await db.query.spaces.findFirst({
    where: eq(spaces.id, parseInt(params.id)),
  });

  if (!space) {
    return {
      title: 'Space Not Found',
    };
  }

  return {
    title: `Space - ${space.name}`,
    description: space.description || `Details for space: ${space.name}`,
  };
}

export default async function SpaceDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return notFound();
  }
  
  const spaceId = parseInt(params.id);
  
  // Fetch the space details
  const space = await db.query.spaces.findFirst({
    where: eq(spaces.id, spaceId),
  });
  
  if (!space) {
    notFound();
  }
  
  // Fetch space members
  const members = await db.query.userSpaces.findMany({
    where: eq(userSpaces.spaceId, spaceId),
    with: {
      user: true,
    },
  });
  
  // Fetch dashboards in this space
  const spaceDashboards = await db.query.dashboards.findMany({
    where: eq(dashboards.spaceId, spaceId),
  });
  
  // Fetch widgets in this space
  const spaceWidgets = await db.query.widgets.findMany({
    where: eq(widgets.spaceId, spaceId),
  });
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{space.name}</h1>
          <p className="text-muted-foreground mt-1">{space.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/spaces/${space.id}/edit`}>
            <Button variant="outline">Edit Space</Button>
          </Link>
          <Link href="/spaces">
            <Button variant="secondary">Back to Spaces</Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Space Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <p className="text-sm font-medium">Name:</p>
                <p className="text-sm text-muted-foreground">{space.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Description:</p>
                <p className="text-sm text-muted-foreground">{space.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Slug:</p>
                <p className="text-sm text-muted-foreground">{space.slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Default Space:</p>
                <p className="text-sm text-muted-foreground">{space.isDefault ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Created:</p>
                <p className="text-sm text-muted-foreground">{space.createdAt?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Statistics:</p>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{members.length}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{spaceDashboards.length}</p>
                    <p className="text-xs text-muted-foreground">Dashboards</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold">{spaceWidgets.length}</p>
                    <p className="text-xs text-muted-foreground">Widgets</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Space Members</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-muted-foreground text-sm">No members in this space yet.</p>
              ) : (
                <div className="space-y-4">
                  {members.map((membership) => (
                    <div key={membership.userId} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {membership.user?.displayName?.charAt(0) || membership.user?.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{membership.user?.displayName || membership.user?.username}</p>
                          <p className="text-xs text-muted-foreground">{membership.role}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Joined {membership.joinedAt?.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dashboards</CardTitle>
              <Link href="/dashboard/create">
                <Button size="sm">Create Dashboard</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {spaceDashboards.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No dashboards in this space yet.</p>
                  <Link href="/dashboard/create">
                    <Button>Create Your First Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaceDashboards.map((dashboard) => (
                    <Link key={dashboard.id} href={`/dashboard/${dashboard.id}`}>
                      <div className="border rounded-md p-4 hover:bg-muted/50 transition-colors">
                        <h3 className="font-medium">{dashboard.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {dashboard.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created {dashboard.createdAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="widgets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Widgets</CardTitle>
              <Link href="/widgets">
                <Button size="sm">Manage Widgets</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {spaceWidgets.length === 0 ? (
                <p className="text-muted-foreground">No widgets in this space yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaceWidgets.map((widget) => (
                    <div key={widget.id} className="border rounded-md p-4">
                      <h3 className="font-medium">{widget.name}</h3>
                      <div className="flex justify-between mt-2">
                        <p className="text-xs bg-muted px-2 py-1 rounded-full">
                          {widget.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {widget.createdAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}