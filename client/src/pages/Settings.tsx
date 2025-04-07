import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  UserIcon, 
  BellIcon, 
  ShieldIcon, 
  MonitorIcon, 
  SaveIcon,
  RefreshCwIcon
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Technical Interviewer"
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    interviewReminders: true,
    candidateUpdates: false,
    reportGeneration: true
  });

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    compactView: false,
    fontSize: "medium",
    questionDisplayCount: 5
  });

  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle display toggle
  const handleDisplayToggle = (setting: keyof typeof displaySettings) => {
    if (typeof displaySettings[setting] === 'boolean') {
      setDisplaySettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };

  // Handle number input change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);

    if (!isNaN(numValue) && numValue > 0) {
      setDisplaySettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  // Save settings
  const saveSettings = () => {
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
      });
    }, 1000);
  };

  // Reset settings
  const resetSettings = () => {
    // Show confirmation toast
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
      variant: "default",
    });
  };

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    //Simulate API call to change password.  Replace with actual API call.
    if(newPassword === confirmPassword && newPassword.length >=6){
      setTimeout(() => {
        setSaving(false);
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
          variant: "default",
        });
      }, 1000);
    } else {
      setTimeout(() => {
        setSaving(false);
        toast({
          title: "Password Change Failed",
          description: "Passwords do not match or are less than 6 characters",
          variant: "error",
        });
      }, 1000);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <MonitorIcon className="h-4 w-4" />
              <span>Display</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileSettings.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={profileSettings.role}
                    onChange={handleProfileChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetSettings}>
                  Reset
                </Button>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Interview Reminders</h4>
                      <p className="text-sm text-gray-500">Get reminders for upcoming interviews</p>
                    </div>
                    <Switch
                      checked={notificationSettings.interviewReminders}
                      onCheckedChange={() => handleNotificationToggle('interviewReminders')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Candidate Updates</h4>
                      <p className="text-sm text-gray-500">Receive notifications when candidate information changes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.candidateUpdates}
                      onCheckedChange={() => handleNotificationToggle('candidateUpdates')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Report Generation</h4>
                      <p className="text-sm text-gray-500">Get notified when new reports are generated</p>
                    </div>
                    <Switch
                      checked={notificationSettings.reportGeneration}
                      onCheckedChange={() => handleNotificationToggle('reportGeneration')}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetSettings}>
                  Reset
                </Button>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize the appearance and behavior of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Dark Mode</h4>
                      <p className="text-sm text-gray-500">Use dark theme for the application</p>
                    </div>
                    <Switch
                      checked={displaySettings.darkMode}
                      onCheckedChange={() => handleDisplayToggle('darkMode')}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Compact View</h4>
                      <p className="text-sm text-gray-500">Show more content with less spacing</p>
                    </div>
                    <Switch
                      checked={displaySettings.compactView}
                      onCheckedChange={() => handleDisplayToggle('compactView')}
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questionDisplayCount">Questions Per Page</Label>
                      <Input
                        id="questionDisplayCount"
                        name="questionDisplayCount"
                        type="number"
                        min="1"
                        max="20"
                        value={displaySettings.questionDisplayCount.toString()}
                        onChange={handleNumberChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <div>
                        <select
                          id="fontSize"
                          name="fontSize"
                          className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          value={displaySettings.fontSize}
                          onChange={(e) => setDisplaySettings(prev => ({ ...prev, fontSize: e.target.value }))}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetSettings}>
                  Reset
                </Button>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        name="currentPassword"
                        type="password" 
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          name="newPassword"
                          type="password" 
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          name="confirmPassword"
                          type="password" 
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full md:w-auto flex items-center"
                      >
                        <RefreshCwIcon className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                  </form>
                  <Separator className="my-2" />
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Sessions</h4>
                    <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-gray-500">Started: Today at 09:32 AM</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}