'use client';
import { Data, Day, Food, emptyDay, today, waterGoal } from '@/lib/store';
import { vt } from '@/lib/motion';
import type { Preset } from '@/lib/foods';
import Water from './Water';
import Nutrition from './Nutrition';
import FoodAdd from './FoodAdd';
import FoodTable from './FoodTable';
import { proteinGoal } from '@/lib/tdee';
import { ChevL, ChevR, Lock } from './Icons';

type Props = { foods: Preset[]; data: Data; date: string; setDate: (d: string) => void; update: (fn: (d: Data) => void) => void };

export default function Today({ foods, data, date, setDate, update }: Props) {
  const day: Day = data.days[date] ?? emptyDay();
  const closed = !!day.closed;
  const edit = (fn: (d: Day) => void) => update(x => fn((x.days[date] ??= emptyDay())));
  const goal = waterGoal(date, day.train);
  const go = (d: string) => vt(() => setDate(d));

  const shift = (n: number) => {
    const d = new Date(date + 'T12:00');
    d.setDate(d.getDate() + n);
    go(d.toLocaleDateString('sv'));
  };
  const label = new Date(date + 'T12:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <>
      <div className="daynav">
        <button className="icon-btn" aria-label="Giorno precedente" onClick={() => shift(-1)}><ChevL /></button>
        <label className="datepick">
          {label}
          <input type="date" aria-label="Scegli il giorno" value={date} onClick={e => e.currentTarget.showPicker?.()}
            onChange={e => e.target.value && go(e.target.value)} />
        </label>
        {date !== today() && <button className="today-btn" onClick={() => go(today())}>Oggi</button>}
        <button className="icon-btn" aria-label="Giorno successivo" onClick={() => shift(1)}><ChevR /></button>
      </div>

      {closed && <div className="closed"><Lock />Giornata conclusa. Riaprila per modificare.</div>}

      <div className="cols">
        <div className="col">
          <fieldset disabled={closed}><Water date={date} day={day} goal={goal} edit={edit} /></fieldset>
          <Nutrition foods={day.foods} kgoal={data.kgoal} pgoal={data.profile && proteinGoal(data.profile)} fmax={data.fmax} update={update} />
        </div>
        <div className="col">
          <fieldset disabled={closed}><FoodAdd foods={foods} onAdd={(f: Food) => edit(d => { d.foods.push(f); })} /></fieldset>
          <FoodTable foods={day.foods} fmax={data.fmax} closed={closed}
            onRemove={i => edit(d => { d.foods.splice(i, 1); })}
            onFinish={() => edit(d => { d.closed = true; })}
            onReopen={() => edit(d => { d.closed = false; })} />
        </div>
      </div>
    </>
  );
}
