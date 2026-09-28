import { useState } from 'react';
import {
  FaPhone, FaCopy, FaCheck, FaBus, FaMapMarkerAlt,
  FaChevronDown, FaChevronUp,
} from 'react-icons/fa';

const POINTS = [
  {
    id: 1,
    name: 'الديوان العام',
    supervisors: [
      { name: 'محمد عبد الغفور', phone: '01028885187' },
      { name: 'خالد حسن', phone: '01069260173' },
      { name: 'مصطفى عدلي', phone: '01065277756' },
      { name: 'محمد صادق', phone: '01061141200' },
      { name: 'احمد عافية', phone: '01060044880' },
      { name: 'محمد عفيفي', phone: '01090198886' },
      { name: 'محمد حمدى', phone: '01551066673' },
      { name: 'محمد صبرى', phone: '01555155597' },
      { name: 'وليد عز', phone: '01555951194' },
      { name: 'محمد عابد', phone: '01555647075' },
    ],
  },
  {
    id: 2,
    name: 'الدقى',
    supervisors: [
      { name: 'مشرف الدقى', phone: '01024632333' },
      { name: 'محمود شوقى', phone: '01000001401' },
      { name: 'محمد لطفى', phone: '01550002595' },
    ],
  },
  { id: 10, name: 'نصر 1', supervisors: [{ name: 'إبراهيم السيسى', phone: '01551354888' }] },
  { id: 11, name: 'نصر 2', supervisors: [{ name: 'إبراهيم السيسى', phone: '01551354888' }] },
  { id: 12, name: 'نصر 3', supervisors: [{ name: 'إبراهيم السيسى', phone: '01551354888' }] },
  { id: 13, name: 'نصر 4', supervisors: [{ name: 'إبراهيم السيسى', phone: '01551354888' }] },
  { id: 14, name: 'السالم', supervisors: [{ name: 'إبراهيم العاصى', phone: '01068195235' }] },
  { id: 15, name: 'النزهه', supervisors: [{ name: 'إبراهيم العاصى', phone: '01068195235' }] },
  { id: 16, name: 'العباسيه', supervisors: [{ name: 'كريم صابر', phone: '01201715413' }] },
  { id: 17, name: 'الماظه', supervisors: [{ name: 'محمود فخرى', phone: '01555662070' }] },
  { id: 18, name: 'أكتوبر', supervisors: [{ name: 'على هاشم', phone: '01552344470' }] },
  { id: 19, name: 'الهرم', supervisors: [{ name: 'على هاشم', phone: '01552344470' }] },
  { id: 20, name: 'الرماية', supervisors: [{ name: 'على هاشم', phone: '01552344470' }] },
  { id: 21, name: 'المريوطية', supervisors: [{ name: 'على هاشم', phone: '01552344470' }] },
  { id: 22, name: 'زايد', supervisors: [{ name: 'على هاشم', phone: '01552344470' }] },
  { id: 23, name: 'العمرانيه', supervisors: [{ name: 'محمد رضوان', phone: '01550446664' }] },
  { id: 24, name: 'حلوان', supervisors: [{ name: 'تامر عبد الصمد', phone: '01028885883' }] },
  { id: 25, name: 'شبرا مصر', supervisors: [{ name: 'محمد فاروق', phone: '01069700338' }] },
  { id: 26, name: 'الزمالك', supervisors: [{ name: 'وليد عبد العليم', phone: '01062342819' }] },
  { id: 27, name: 'طلعت حرب', supervisors: [] },
  { id: 28, name: 'الروضه', supervisors: [{ name: 'مصطفى مكسر', phone: '01552010001' }] },
  { id: 29, name: 'باب اللوق', supervisors: [{ name: 'مصطفى مكسر', phone: '01552010001' }] },
  { id: 30, name: 'حدائق حلوان', supervisors: [{ name: 'مصطفى مكسر', phone: '01552010001' }] },
  { id: 31, name: 'مايو 15', supervisors: [{ name: 'مصطفى مكسر', phone: '01552010001' }] },
  { id: 32, name: 'التبين', supervisors: [{ name: 'مصطفى مكسر', phone: '01552010001' }] },
  { id: 33, name: 'الشرابيه', supervisors: [{ name: 'مصطفى مكسر', phone: '01552010001' }] },
  { id: 34, name: 'جراج شبرا', supervisors: [{ name: 'تامر عبد الصمد', phone: '01028885883' }] },
  { id: 35, name: 'مبنى ميناتل', supervisors: [{ name: 'محمد شرش', phone: '01555133555' }] },
  { id: 36, name: 'مخازن الشرابيه', supervisors: [{ name: 'احمد على', phone: '01002327650' }] },
  { id: 37, name: 'جراج السبيل', supervisors: [{ name: 'سامى السعداوى', phone: '01555903005' }] },
  { id: 38, name: 'التسويق', supervisors: [{ name: 'الهام السيد', phone: '01099326660' }] },
  {
    id: 39,
    name: 'قطاع شرق القاهرة والقاهرة الجديدة',
    supervisors: [
      { name: 'محمد عابد', phone: '01555647075' },
      { name: 'محمد شرش', phone: '01555133555' },
      { name: 'مروة رمضان', phone: '01001970083' },
    ],
  },
];

const BusGatheringPoints = () => {
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [expandedPoint, setExpandedPoint] = useState(null);

  const copyPhone = async (phone) => {
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

  const togglePoint = (id) => {
    setExpandedPoint(expandedPoint === id ? null : id);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
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
              اضغط على أي نقطة لعرض المشرفين وأرقام التواصل
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {POINTS.map((point) => {
          const isExpanded = expandedPoint === point.id;
          return (
            <div key={point.id} className="transition-colors">
              <button
                onClick={() => togglePoint(point.id)}
                className="w-full flex items-center justify-between gap-3 p-4 md:p-5 hover:bg-primary/5 transition text-right"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-black text-sm">{point.id}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <FaMapMarkerAlt className="text-secondary flex-shrink-0" />
                    <h3 className="font-black text-primary text-sm md:text-base truncate">
                      {point.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 font-bold hidden sm:inline">
                    {point.supervisors.length} مشرف
                  </span>
                  {isExpanded ? (
                    <FaChevronUp className="text-primary text-sm" />
                  ) : (
                    <FaChevronDown className="text-primary text-sm" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-gray-50/60 px-4 md:px-5 pb-4 md:pb-5 pt-2 space-y-2">
                  {point.supervisors.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-2">
                      لم يتم تحديد مشرفين بعد
                    </p>
                  ) : (
                    point.supervisors.map((sup, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-primary/30 hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black text-xs">
                              {sup.name ? sup.name.charAt(0) : '؟'}
                            </span>
                          </div>
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {sup.name || 'مشرف'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={`tel:${sup.phone}`}
                            className="text-primary font-black text-xs md:text-sm tracking-wider hover:text-secondary transition"
                            dir="ltr"
                          >
                            {sup.phone}
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPhone(sup.phone);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                              copiedPhone === sup.phone
                                ? 'bg-green-100 text-green-600'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                            title="نسخ الرقم"
                          >
                            {copiedPhone === sup.phone ? (
                              <FaCheck className="text-xs" />
                            ) : (
                              <FaCopy className="text-xs" />
                            )}
                          </button>

                          <a
                            href={`tel:${sup.phone}`}
                            className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition"
                            title="اتصال"
                          >
                            <FaPhone className="text-xs" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 p-4 text-center">
        <p className="text-xs text-gray-600 font-bold">
          💡 يمكنك نسخ رقم المشرف بالضغط على أيقونة النسخ، أو الاتصال مباشرة بالضغط على أيقونة الهاتف
        </p>
      </div>
    </div>
  );
};

export default BusGatheringPoints;