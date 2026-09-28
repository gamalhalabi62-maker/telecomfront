import { useState } from 'react';
import { FaPhone, FaCopy, FaCheck, FaBus } from 'react-icons/fa';

const ROWS = [
  // الديوان العام
  { point: 'الديوان العام', supervisor: 'محمد عبد الغفور', phone: '01028885187' },
  { point: 'الديوان العام', supervisor: 'خالد حسن', phone: '01069260173' },
  { point: 'الديوان العام', supervisor: 'مصطفى عدلي', phone: '01065277756' },
  { point: 'الديوان العام', supervisor: 'محمد صادق', phone: '01061141200' },
  
  // القرية الذكية
  { point: 'القرية الذكية', supervisor: 'احمد عافية', phone: '01060044880' },
  { point: 'القرية الذكية', supervisor: 'محمد عفيفي', phone: '01090198886' },
  { point: 'القرية الذكية', supervisor: 'محمد حمدى', phone: '01551066673' },
  { point: 'القرية الذكية', supervisor: 'محمد صبرى', phone: '01555155597' },

  // نقاط أخرى
  { point: 'محطة مترو أرض المعارض', supervisor: 'وليد عز', phone: '01555951194' },
  { point: 'الورش', supervisor: 'محمد عابد', phone: '01555647075' },

  // الدقى، المهندسين، والجيزة (تحت إشراف محمود شوقي)
  { point: 'الدقى', supervisor: 'محمود شوقي', phone: '01024632333' },
  { point: 'المهندسين', supervisor: 'محمود شوقى', phone: '01000001401' },
  { point: 'الجيزة', supervisor: 'محمود شوقي', phone: '01550002595' },

  { point: 'القبة', supervisor: 'محمد لطفى', phone: '01000001401' },
  { point: 'مصر الجديدة', supervisor: 'احمد عباس', phone: '01550002595' },

  // نصر
  { point: 'نصر 1', supervisor: 'إبراهيم السيسى', phone: '01551354888' },
  { point: 'نصر 2', supervisor: 'إبراهيم السيسى', phone: '01551354888' },
  { point: 'نصر 3', supervisor: 'إبراهيم السيسى', phone: '01551354888' },
  { point: 'نصر 4', supervisor: 'إبراهيم السيسى', phone: '01551354888' },

  { point: 'السلام', supervisor: 'إبراهيم العاصى', phone: '01068195235' },
  { point: 'السلام', supervisor: 'عماد مسعد', phone: '01201715413' },
  { point: 'النزهه', supervisor: 'كريم صابر', phone: '01555662070' },
  { point: 'العباسيه', supervisor: 'محمود فخرى', phone: '01552650007' },
  { point: 'الماظه', supervisor: 'على هاشم', phone: '01552344470' },

  // أكتوبر والهرم وباقي المجموعات التابعة لعلاء نبيل
  { point: 'أكتوبر', supervisor: 'علاء نبيل', phone: '01551920111' },
  { point: 'الهرم', supervisor: 'علاء نبيل', phone: '01551920111' },
  { point: 'الرماية', supervisor: 'علاء نبيل', phone: '01551920111' },
  { point: 'المريوطية', supervisor: 'علاء نبيل', phone: '01551920111' },
  { point: 'زايد', supervisor: 'علاء نبيل', phone: '01551920111' },
  { point: 'العمرانيه', supervisor: 'علاء نبيل', phone: '01551920111' },

  { point: 'حلوان', supervisor: 'محمد رضوان', phone: '01550446664' },
  { point: 'شبرا مصر', supervisor: 'تامر عبد الصمد', phone: '01028885883' },
  { point: 'الزمالك', supervisor: 'محمد فاروق', phone: '01069700338' },
  { point: 'طلعت حرب', supervisor: 'وليد عبد العليم', phone: '01062342819' },

  // مجموعة مصطفى مكسر
  { point: 'الروضه', supervisor: 'مصطفى مكسر', phone: '01552010001' },
  { point: 'باب اللوق', supervisor: 'مصطفى مكسر', phone: '01552010001' },
  { point: 'حدائق حلوان', supervisor: 'مصطفى مكسر', phone: '01552010001' },
  { point: 'مايو 15', supervisor: 'مصطفى مكسر', phone: '01552010001' },
  { point: 'التبين', supervisor: 'مصطفى مكسر', phone: '01552010001' },
  { point: 'الشرابيه', supervisor: 'مصطفى مكسر', phone: '01552010001' },

  { point: 'جراج شبرا', supervisor: 'تامر عبد الصمد', phone: '01028885883' },
  { point: 'مبنى ميناتل', supervisor: 'محمد شرشر', phone: '01555133555' },
  
  // مخازن الشرابية (ثلاثة مشرفين: أحمد علي، سامي السعداوي، إلهام السيد)
  { point: 'مخازن الشرابيه', supervisor: 'احمد على', phone: '01002327650' },
  { point: 'مخازن الشرابيه', supervisor: 'سامى السعداوى', phone: '01555903005' },
  { point: 'مخازن الشرابيه', supervisor: 'الهام السيد', phone: '01099326660' },

  // جراج السبيل (محمد عابد)
  { point: 'جراج السبيل', supervisor: 'محمد عابد', phone: '01555647075' },

  // التسويق (محمد شرشر)
  { point: 'التسويق', supervisor: 'محمد شرشر', phone: '01555133555' },

  // قطاعي شرق القاهرة والقاهرة الجديدة (مروة رمضان)
  { point: 'قطاع شرق القاهرة والقاهرة الجديدة', supervisor: 'مروة رمضان', phone: '01001970083' },
];

const POINT_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800',
  'bg-yellow-100 text-yellow-800',
  'bg-red-100 text-red-800',
  'bg-cyan-100 text-cyan-800',
];

const BusGatheringPoints = () => {
  const [copiedPhone, setCopiedPhone] = useState(null);

  const copyPhone = async (phone) => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = phone;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const getPointColor = (point) => {
    let hash = 0;
    for (let i = 0; i < point.length; i++) {
      hash = point.charCodeAt(i) + ((hash << 5) - hash);
    }
    return POINT_COLORS[Math.abs(hash) % POINT_COLORS.length];
  };

  const groupedRows = ROWS.reduce((acc, row) => {
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.point === row.point) {
      lastGroup.rows.push(row);
    } else {
      acc.push({ point: row.point, rows: [row] });
    }
    return acc;
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-secondary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FaBus className="text-primary text-2xl" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black mb-1">نقاط تجمع الباصات</h2>
            <p className="text-gray-200 text-xs md:text-sm">
              اضغط على رقم المشرف لنسخه أو اتصل به مباشرة
            </p>
          </div>
        </div>
      </div>

      {/* Mobile view - Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {groupedRows.map((group) => (
          <div key={group.point} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${getPointColor(group.point)}`}>
                {group.point}
              </span>
              <span className="text-xs text-gray-400 font-bold">
                ({group.rows.length} مشرف)
              </span>
            </div>

            <div className="space-y-2">
              {group.rows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <p className="font-bold text-gray-800 text-sm truncate flex-1">
                    {row.supervisor || '—'}
                  </p>

                  {row.phone ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`tel:${row.phone}`}
                        className="text-primary font-black text-xs tracking-wider"
                        dir="ltr"
                      >
                        {row.phone}
                      </a>

                      <button
                        onClick={() => copyPhone(row.phone)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                          copiedPhone === row.phone
                            ? 'bg-green-100 text-green-600'
                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        {copiedPhone === row.phone ? (
                          <FaCheck className="text-xs" />
                        ) : (
                          <FaCopy className="text-xs" />
                        )}
                      </button>

                      <a
                        href={`tel:${row.phone}`}
                        className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition"
                      >
                        <FaPhone className="text-xs" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">لا يوجد</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white sticky top-0">
            <tr>
              <th className="px-4 py-4 text-right text-sm font-black w-16">م</th>
              <th className="px-4 py-4 text-right text-sm font-black">نقطة تجمع الباصات</th>
              <th className="px-4 py-4 text-right text-sm font-black">المشرف</th>
              <th className="px-4 py-4 text-right text-sm font-black w-56">الموبايل</th>
              <th className="px-4 py-4 text-center text-sm font-black w-32">تواصل</th>
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((group, groupIdx) =>
              group.rows.map((row, rowIdx) => {
                const isFirst = rowIdx === 0;
                const rowSpan = group.rows.length;
                const globalIndex = groupedRows
                  .slice(0, groupIdx)
                  .reduce((sum, g) => sum + g.rows.length, 0) + rowIdx + 1;

                return (
                  <tr
                    key={`${groupIdx}-${rowIdx}`}
                    className={`${
                      rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-primary/5 transition border-b border-gray-100`}
                  >
                    <td className="px-4 py-3 text-center text-sm font-bold text-gray-400">
                      {globalIndex}
                    </td>

                    {isFirst && (
                      <td
                        rowSpan={rowSpan}
                        className="px-4 py-3 align-middle border-l border-gray-100"
                      >
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-xs font-black ${getPointColor(
                            group.point
                          )}`}
                        >
                          {group.point}
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800 text-sm">
                        {row.supervisor || <span className="text-gray-400 italic">—</span>}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {row.phone ? (
                        <span
                          className="font-black text-primary text-sm tracking-wider"
                          dir="ltr"
                        >
                          {row.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">لا يوجد</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {row.phone ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => copyPhone(row.phone)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                              copiedPhone === row.phone
                                ? 'bg-green-100 text-green-600'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                            title="نسخ الرقم"
                          >
                            {copiedPhone === row.phone ? (
                              <FaCheck className="text-sm" />
                            ) : (
                              <FaCopy className="text-sm" />
                            )}
                          </button>

                          <a
                            href={`tel:${row.phone}`}
                            className="w-9 h-9 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition"
                            title="اتصال"
                          >
                            <FaPhone className="text-sm" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="bg-primary/5 p-4 text-center border-t border-primary/10">
        <p className="text-xs text-gray-600 font-bold">
          💡 اضغط على أيقونة النسخ لنسخ الرقم، أو أيقونة الهاتف للاتصال المباشر
        </p>
      </div>
    </div>
  );
};

export default BusGatheringPoints;