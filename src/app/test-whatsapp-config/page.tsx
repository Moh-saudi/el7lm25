'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ConfigStatus {
  success: boolean;
  defaultType: string;
  config: {
    beon: {
      smsToken: string;
      whatsappToken: string;
      valid: boolean;
    };
    business: {
      token: string;
      phoneId: string;
      valid: boolean;
    };
    green: {
      token: string;
      instance: string;
      valid: boolean;
    };
  };
  message: string;
  recommendations: string[];
}

export default function TestWhatsAppConfig() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/notifications/whatsapp/test-config');
      const data = await response.json();
      
      if (response.ok) {
        setConfigStatus(data);
      } else {
        setError(data.error || 'Failed to check configuration');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status.includes('❌')) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'text-green-600';
    if (status.includes('❌')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Configuration Test</h1>
        <p className="text-gray-600">
          This page helps you verify your WhatsApp configuration for the OTP system.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={checkConfig} disabled={loading}>
          {loading ? 'Checking...' : 'Refresh Configuration'}
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {configStatus && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {configStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Configuration Status
              </CardTitle>
              <CardDescription>
                {configStatus.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span>Default Type:</span>
                <Badge variant={configStatus.success ? "default" : "destructive"}>
                  {configStatus.defaultType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* BeOn Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>BeOn Configuration</CardTitle>
              <CardDescription>
                SMS and WhatsApp tokens for BeOn service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>SMS Token:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.config.beon.smsToken)}
                  <span className={getStatusColor(configStatus.config.beon.smsToken)}>
                    {configStatus.config.beon.smsToken}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>WhatsApp Token:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.config.beon.whatsappToken)}
                  <span className={getStatusColor(configStatus.config.beon.whatsappToken)}>
                    {configStatus.config.beon.whatsappToken}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Overall Status:</span>
                <Badge variant={configStatus.config.beon.valid ? "default" : "destructive"}>
                  {configStatus.config.beon.valid ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Business API */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API</CardTitle>
              <CardDescription>
                Meta WhatsApp Business API configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Access Token:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.config.business.token)}
                  <span className={getStatusColor(configStatus.config.business.token)}>
                    {configStatus.config.business.token}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Phone ID:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.config.business.phoneId)}
                  <span className={getStatusColor(configStatus.config.business.phoneId)}>
                    {configStatus.config.business.phoneId}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Overall Status:</span>
                <Badge variant={configStatus.config.business.valid ? "default" : "destructive"}>
                  {configStatus.config.business.valid ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Green API */}
          <Card>
            <CardHeader>
              <CardTitle>Green API</CardTitle>
              <CardDescription>
                Green API configuration (alternative WhatsApp service)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Token:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.config.green.token)}
                  <span className={getStatusColor(configStatus.config.green.token)}>
                    {configStatus.config.green.token}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Instance ID:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.config.green.instance)}
                  <span className={getStatusColor(configStatus.config.green.instance)}>
                    {configStatus.config.green.instance}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Overall Status:</span>
                <Badge variant={configStatus.config.green.valid ? "default" : "destructive"}>
                  {configStatus.config.green.valid ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {configStatus.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {configStatus.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 