import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  lastPasswordChange: string | null;
}

interface UserSettings {
  dataSharing?: boolean;
  analytics?: boolean;
  emailNotifications?: boolean;
  twoFactorAuth?: boolean;
  sessionTimeout?: number;
  lastPasswordChange?: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(session.user.id)),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userSettings = (user.settings || {}) as UserSettings;
    const settings: PrivacySettings = {
      dataSharing: userSettings.dataSharing ?? false,
      analytics: userSettings.analytics ?? false,
      emailNotifications: userSettings.emailNotifications ?? true,
      twoFactorAuth: userSettings.twoFactorAuth ?? false,
      sessionTimeout: userSettings.sessionTimeout ?? 30,
      lastPasswordChange: userSettings.lastPasswordChange ?? null,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      dataSharing,
      analytics,
      emailNotifications,
      twoFactorAuth,
      sessionTimeout,
    } = body;

    if (
      typeof dataSharing !== 'boolean' ||
      typeof analytics !== 'boolean' ||
      typeof emailNotifications !== 'boolean' ||
      typeof twoFactorAuth !== 'boolean' ||
      typeof sessionTimeout !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(session.user.id)),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSettings = (user.settings || {}) as UserSettings;
    const updatedSettings: UserSettings = {
      ...currentSettings,
      dataSharing,
      analytics,
      emailNotifications,
      twoFactorAuth,
      sessionTimeout,
    };

    await db
      .update(users)
      .set({ settings: updatedSettings })
      .where(eq(users.id, Number(session.user.id)));

    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
} 