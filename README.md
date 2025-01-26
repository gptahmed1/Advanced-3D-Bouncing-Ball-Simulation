README.md
Advanced 3D Bouncing Ball Simulation
مقدمة

هذا المشروع هو عبارة عن محاكاة فيزيائية ثلاثية الأبعاد لكرة ترتد داخل مجسم هندسي يُعرف باسم "rhombicosidodecahedron" (شكل هندسي متعدد الأوجه) باستخدام مكتبة Three.js للرسوميات ثلاثية الأبعاد و stats.js لعرض إحصائيات الأداء. تم تصميم المحاكاة لتكون تفاعلية، مما يسمح للمستخدم بالتحكم في سرعة الكرة، والجاذبية، وسرعة دوران المجسم الهندسي.

المميزات

محاكاة فيزيائية دقيقة: تستخدم المحاكاة معادلات فيزيائية لحساب حركة الكرة، بما في ذلك الجاذبية، والاصطدامات، وفقدان الطاقة.

مجسم هندسي ثلاثي الأبعاد: يتم استخدام مجسم "rhombicosidodecahedron" كبيئة للمحاكاة، مما يوفر تجربة بصرية غنية.

تحكم تفاعلي: يمكن للمستخدم التحكم في:

سرعة الكرة: من خلال شريط تمرير Ball Speed.

الجاذبية: من خلال شريط تمرير Gravity.

سرعة دوران المجسم: من خلال شريط تمرير Rotation Speed.

إعادة ضبط المحاكاة: زر Reset Simulation يعيد الكرة إلى وضعها الأولي.

عرض إحصائيات الأداء: تعرض لوحة Performance Stats إحصائيات الأداء مثل عدد الإطارات في الثانية (FPS).

تصميم متجاوب: يتكيف التصميم مع أحجام الشاشات المختلفة، بما في ذلك الأجهزة المحمولة.

مؤثرات بصرية: تم استخدام الإضاءة والظلال لإضفاء مزيد من الواقعية على المشهد.

كود مُنظم: تم تقسيم الكود إلى وحدات (modules) لسهولة القراءة والصيانة.

المتطلبات

متصفح ويب حديث يدعم WebGL.

اتصال بالإنترنت لتحميل مكتبات Three.js و stats.js.

كيفية التشغيل

قم بفتح ملف 1.txt في متصفح الويب.

ستظهر المحاكاة على الشاشة.

استخدم أشرطة التمرير للتحكم في سرعة الكرة، والجاذبية، وسرعة دوران المجسم.

اضغط على زر Reset Simulation لإعادة الكرة إلى وضعها الأولي.

شرح الكود
ملف index (HTML)

يحتوي على هيكل الصفحة الأساسي.

يتضمن مكتبات Three.js و stats.js من خلال CDN.

يحتوي على عنصر canvas الذي يتم رسم المحاكاة عليه.

يحتوي على عناصر التحكم (أشرطة التمرير وزر إعادة الضبط).

يحتوي على لوحة عرض إحصائيات الأداء.

يربط ملف main.js الذي يحتوي على كود JavaScript.

ملف main.js (JavaScript)

PhysicsSimulation:

مسؤول عن حساب حركة الكرة.

يأخذ كائن ball، ومصفوفة faces (وجوه المجسم)، و options (خيارات إضافية) كمدخلات.

يحتوي على خصائص مثل initialPosition، initialVelocity، gravity، dampening، radius.

يحتوي على طرق:

setupControls(): لإعداد عناصر التحكم (أشرطة التمرير وزر إعادة الضبط).

reset(): لإعادة الكرة إلى وضعها الأولي.

update(delta): لتحديث حركة الكرة في كل إطار.

checkCollisions(): لاكتشاف الاصطدامات بين الكرة ووجوه المجسم.

Scene:

مسؤول عن إعداد المشهد ثلاثي الأبعاد.

يحتوي على طرق:

init(): لتهيئة Three.js (إنشاء scene، camera، renderer).

createGeometry(): لإنشاء المجسم الهندسي والكرة.

getFaceData(geometry): لاستخراج بيانات وجوه المجسم.

createLights(): لإضافة الإضاءة إلى المشهد.

setupStats(): لإعداد stats.js.

setupAnimation(): لإعداد حلقة الرسوم المتحركة.

setupResizeHandler(): لمعالجة تغيير حجم الشاشة.

ملف styles.css (CSS)

يحتوي على الأنماط (styles) الخاصة بعناصر الصفحة.

يُحدد مظهر عناصر التحكم، ولوحة إحصائيات الأداء، وخلفية الصفحة.

يستخدم media queries لجعل التصميم متجاوبًا مع أحجام الشاشات المختلفة.

شرح الخوارزميات
اكتشاف الاصطدامات

يتم حساب المسافة بين مركز الكرة وكل وجه من وجوه المجسم باستخدام THREE.Plane.distanceToPoint().

إذا كانت المسافة أقل من نصف قطر الكرة، فهذا يعني أن الكرة اصطدمت بالوجه.

يتم حساب متجه الانعكاس باستخدام THREE.Vector3.reflect().

يتم تحديث سرعة الكرة باستخدام متجه الانعكاس مع مراعاة فقدان الطاقة.

يتم تصحيح موضع الكرة لمنعها من اختراق الوجه.

تحديث حركة الكرة

يتم حساب التسارع بناءً على الجاذبية.

يتم حساب السرعة الجديدة بإضافة التسارع مضروبًا في الزمن (delta) إلى السرعة الحالية.

يتم حساب الموضع الجديد بإضافة السرعة مضروبة في الزمن (delta) ونصف التسارع مضروبًا في مربع الزمن (delta) إلى الموضع الحالي.

يتم ضرب السرعة في معامل الاحتكاك (0.999) لمحاكاة مقاومة الهواء.

تحسينات مستقبلية

إضافة المزيد من المجسمات الهندسية.

إضافة إمكانية تغيير لون الكرة والمجسم.

إضافة إمكانية التقاط لقطات شاشة أو تسجيل فيديو للمحاكاة.

إضافة دعم للواقع الافتراضي (VR) والواقع المعزز (AR).

تحسين أداء المحاكاة باستخدام تقنيات مثل WebGL 2.0 و WebAssembly.

إضافة مؤثرات صوتية.

إضافة إمكانية التحكم في خصائص المواد (material properties) مثل الانعكاس (reflection) واللمعان (shininess).

الخاتمة

هذا المشروع هو مثال رائع على كيفية استخدام Three.js لإنشاء محاكاة فيزيائية ثلاثية الأبعاد تفاعلية. يُمكن استخدامه كأداة تعليمية لفهم مبادئ الفيزياء، أو كأداة ترفيهية للاستمتاع بتجربة بصرية غنية.

الترخيص

هذا المشروع مفتوح المصدر ومرخص تحت رخصة MIT.# Advanced-3D-Bouncing-Ball-Simulation
