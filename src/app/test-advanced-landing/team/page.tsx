'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Linkedin, 
  Twitter, 
  Mail, 
  Award,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeamPage() {
  const teamMembers = [
    {
      name: 'أحمد محمد',
      role: 'المؤسس والرئيس التنفيذي',
      image: '👨‍💼',
      bio: 'خبرة 15 عاماً في مجال الرياضة والتكنولوجيا. قاد عدة مشاريع ناجحة في تطوير المواهب الرياضية.',
      achievements: ['أفضل مبادر رياضي 2023', 'جائزة الابتكار التقني', '10+ سنوات في القيادة'],
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'ahmed@el7lm.com'
      }
    },
    {
      name: 'سارة أحمد',
      role: 'مديرة التطوير التقني',
      image: '👩‍💻',
      bio: 'مطورة برمجيات متمرسة مع خبرة واسعة في تطوير المنصات الرياضية والذكاء الاصطناعي.',
      achievements: ['شهادة AWS المتقدمة', 'خبيرة في React & Node.js', 'قائدة فريق تقني'],
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'sara@el7lm.com'
      }
    },
    {
      name: 'محمد علي',
      role: 'مدير العمليات الرياضية',
      image: '⚽',
      bio: 'لاعب كرة قدم سابق ومدرب معتمد. يشرف على جميع العمليات الرياضية والتدريبية في المنصة.',
      achievements: ['مدرب معتمد من FIFA', 'لاعب منتخب سابق', '20+ عام خبرة رياضية'],
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'mohamed@el7lm.com'
      }
    },
    {
      name: 'فاطمة حسن',
      role: 'مديرة التسويق والعلاقات',
      image: '👩‍💼',
      bio: 'خبيرة تسويق رقمي مع تخصص في المجال الرياضي. تدير حملات التسويق والشراكات الاستراتيجية.',
      achievements: ['ماجستير في التسويق الرياضي', 'خبيرة في التسويق الرقمي', 'بناء 100+ شراكة'],
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'fatima@el7lm.com'
      }
    },
    {
      name: 'خالد أحمد',
      role: 'محلل البيانات الرياضية',
      image: '📊',
      bio: 'متخصص في تحليل البيانات الرياضية والذكاء الاصطناعي. يطور نماذج التحليل والتنبؤ بالأداء.',
      achievements: ['دكتوراه في علوم البيانات', 'خبير في Machine Learning', '50+ نموذج تحليلي'],
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'khaled@el7lm.com'
      }
    },
    {
      name: 'نور محمد',
      role: 'مصممة UX/UI',
      image: '🎨',
      bio: 'مصممة واجهات مستخدم مبدعة مع شغف بتحسين تجربة المستخدم في التطبيقات الرياضية.',
      achievements: ['جائزة أفضل تصميم UI', 'خبيرة في Figma & Adobe', '100+ تصميم مبتكر'],
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'nour@el7lm.com'
      }
    }
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: 'التميز',
      description: 'نسعى للتميز في كل ما نقوم به'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'العمل الجماعي',
      description: 'نؤمن بقوة الفريق الواحد'
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'الابتكار',
      description: 'نبتكر حلولاً تقنية متطورة'
    },
    {
      icon: <Award className="w-8 h-8 text-purple-500" />,
      title: 'الجودة',
      description: 'نلتزم بأعلى معايير الجودة'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            تعرف على
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}فريقنا
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            مجموعة من الخبراء المتخصصين والمتحمسين لتطوير الرياضة العربية
          </p>
        </div>
      </motion.section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              قيمنا الأساسية
            </h2>
            <p className="text-xl text-gray-600">
              المبادئ التي توجه عملنا وقراراتنا اليومية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              أعضاء الفريق
            </h2>
            <p className="text-xl text-gray-600">
              الخبراء الذين يقودون رؤيتنا نحو المستقبل
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="overflow-hidden h-full">
                  <CardContent className="p-0">
                    {/* Avatar Section */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center text-white">
                      <div className="text-6xl mb-4">
                        {member.image}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {member.name}
                      </h3>
                      <p className="text-blue-100 font-medium">
                        {member.role}
                      </p>
                    </div>

                    {/* Info Section */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {member.bio}
                      </p>

                      {/* Achievements */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">الإنجازات:</h4>
                        <div className="space-y-2">
                          {member.achievements.map((achievement, achIndex) => (
                            <div key={achIndex} className="flex items-center space-x-2 space-x-reverse">
                              <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center justify-center space-x-4 space-x-reverse">
                        <motion.a
                          href={member.social.linkedin}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </motion.a>
                        <motion.a
                          href={member.social.twitter}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </motion.a>
                        <motion.a
                          href={`mailto:${member.social.email}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                        </motion.a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              هل تريد الانضمام لفريقنا؟
            </h2>
            <p className="text-xl mb-8 opacity-90">
              نبحث دائماً عن المواهب المتميزة للانضمام لرحلتنا
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold">
                تصفح الوظائف
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold">
                تواصل معنا
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


