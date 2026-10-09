import { router } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { ExamCard } from '@/components/ExamCard';
import { Grid } from '@/components/Grid';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { useToday } from '@/hooks/useNow';
import { useResponsive } from '@/hooks/useResponsive';
import { useData, useSubjectMap } from '@/lib/db/DataProvider';
import { countWord } from '@/lib/logic/dates';
import { urgencyOf } from '@/lib/logic/countdown';
import { splitExams } from '@/lib/logic/exams';

type Tab = 'upcoming' | 'past';

export default function ExamsScreen() {
  const today = useToday();
  const { columns } = useResponsive();
  const { data, updateExam } = useData();
  const subjectMap = useSubjectMap();
  const [tab, setTab] = useState<Tab>('upcoming');
  const { upcoming, past } = splitExams(data.exams, today);
  const list = tab === 'upcoming' ? upcoming : past;
  const urgent = upcoming.filter((e) => urgencyOf(e.date, today) === 'urgent').length;

  return (
    <Screen
      title="الامتحانات والتسليمات"
      subtitle={urgent > 0 ? `🔴 ${countWord(urgent, 'حاجة واحدة', 'حاجتين', 'حاجات', 'حاجة')} فاضلها أقل من 3 أيام` : undefined}
      onAdd={() => router.push('/exam-form')}
      addLabel="أضف امتحان"
      toolbar={
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: 'قادم', count: upcoming.length },
            { value: 'past', label: 'فات / خلص', count: past.length },
          ]}
        />
      }
    >
      {list.length === 0 ? (
        tab === 'upcoming' ? (
          <EmptyState
            icon="document-text-outline"
            title="مفيش امتحانات أو تسليمات جاية"
            message="ضيف الكويزات والميدترم والفاينل والـ Assignments، وهنعدّلك الأيام الفاضلة لكل واحد."
            actionLabel="أضف امتحان أو تسليم"
            onAction={() => router.push('/exam-form')}
          />
        ) : (
          <EmptyState icon="archive-outline" title="لسه مفيش حاجة فاتت" message="الامتحانات اللي عدّى ميعادها والتسليمات اللي خلصتها هتظهر هنا." />
        )
      ) : (
        <Grid columns={columns}>
          {list.map((e) => (
            <ExamCard
              key={e.id}
              exam={e}
              subject={e.subjectId ? subjectMap.get(e.subjectId) : undefined}
              today={today}
              onPress={() => router.push({ pathname: '/exam-form', params: { id: e.id } })}
              onToggleDone={() => updateExam(e.id, { done: !e.done })}
            />
          ))}
        </Grid>
      )}
    </Screen>
  );
}
