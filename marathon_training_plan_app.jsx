import React, { useEffect, useMemo, useState } from 'react';

const longRuns = [6, 7, 8, 6, 9, 10, 11, 12, 12, 13, 14, 11, 15, 16, 17, 12, 18, 19, 20, 14, 20, 18, 17, 16, 14, 10, 8, 26.2];
const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const carbRotation = {
  Sunday: 'rice or potatoes',
  Monday: 'rice',
  Tuesday: 'potatoes',
  Wednesday: 'rice',
  Thursday: 'quinoa',
  Friday: 'rice',
  Saturday: 'pasta or potatoes',
};

const breakfastRotation = {
  Sunday: 'Flexible high-protein breakfast, 30–40g protein',
  Monday: '3 eggs + 2 oz oats + 3–4 oz berries',
  Tuesday: '8 oz Greek yogurt + 2 oz oats + berries + 1 tsp honey',
  Wednesday: '2 oz oats + 1 scoop protein + 1/2 banana + 1 tbsp peanut butter',
  Thursday: '3 eggs + 2 oz oats + 3–4 oz berries',
  Friday: '8 oz cottage cheese + fruit or oats',
  Saturday: '4–6 oz steak + 6 oz potatoes or oats',
};

const snackRotation = {
  Sunday: { am: 'Eggs or yogurt', pm: 'Flexible protein snack' },
  Monday: { am: 'Greek yogurt, 8 oz', pm: 'Cottage cheese, 8 oz' },
  Tuesday: { am: 'Protein shake', pm: 'Apple + 1 tbsp peanut butter' },
  Wednesday: { am: '2–3 hard-boiled eggs', pm: 'Greek yogurt, 8 oz' },
  Thursday: { am: 'Jerky, 1 serving', pm: 'Cottage cheese, 8 oz' },
  Friday: { am: 'Protein shake', pm: 'Apple + 1 tbsp peanut butter' },
  Saturday: { am: 'Greek yogurt, 8 oz', pm: 'Protein shake' },
};

const mobilityRoutine = [
  { id: 'catcow', label: 'Cat-cow — 10 reps' },
  { id: 'wgs', label: 'World’s greatest stretch — 5 each side' },
  { id: 'hipflexor', label: 'Hip flexor stretch — 30 sec each side' },
  { id: 'hip90', label: '90/90 hip switches — 10 reps' },
  { id: 'ankle', label: 'Ankle rocks — 10 each side' },
  { id: 'hamstring', label: 'Hamstring floss — 10 each side' },
  { id: 'glutes', label: 'Glute bridges — 2 x 10' },
  { id: 'calf', label: 'Calf stretch — 30 sec each side' },
];

const preRunMobility = [
  { id: 'legswingfb', label: 'Leg swings front/back — 10 each leg' },
  { id: 'legswinglr', label: 'Leg swings side/side — 10 each leg' },
  { id: 'lunges', label: 'Walking lunges — 10 steps' },
  { id: 'highknees', label: 'High knees — 20 sec' },
  { id: 'buttkicks', label: 'Butt kicks — 20 sec' },
  { id: 'anklecircle', label: 'Ankle circles — 10 each direction' },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatTime(totalMinutes) {
  const safeMinutes = Number.isFinite(totalMinutes) ? totalMinutes : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = Math.round(safeMinutes % 60);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${pad(minutes)} ${suffix}`;
}

function parsePace(value) {
  if (!value || !String(value).includes(':')) return null;
  const [minutes, seconds] = String(value).split(':').map(Number);
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return minutes + seconds / 60;
}

function parseDurationToMinutes(value) {
  if (!value) return null;
  const parts = String(value).trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 2) return parts[0] + parts[1] / 60;
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
  return null;
}

function calculatePaceFromDistanceTime(distance, time) {
  const miles = Number(distance);
  const minutes = parseDurationToMinutes(time);
  if (!miles || !minutes || miles <= 0) return '';
  const paceMinutes = minutes / miles;
  const wholeMinutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - wholeMinutes) * 60);
  return `${wholeMinutes}:${pad(seconds)}`;
}

function formatPace(minutes) {
  if (!minutes || Number.isNaN(minutes)) return '--';
  const wholeMinutes = Math.floor(minutes);
  const seconds = Math.round((minutes - wholeMinutes) * 60);
  return `${wholeMinutes}:${pad(seconds)}/mile`;
}

function sunriseToWakeMinutes(time) {
  if (!time || !String(time).includes(':')) return 6 * 60 + 15;
  const [hours, minutes] = String(time).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 6 * 60 + 15;
  return hours * 60 + minutes - 30;
}

function getWeekPlan(week) {
  const index = clamp(Number(week) - 1, 0, longRuns.length - 1);
  const base = 4 + Math.floor(index / 3);
  const tempo = base + 1;
  const longRun = longRuns[index];

  return {
    Sunday: {
      title: 'Recovery / Rest Day', mileage: 0, type: 'recovery', hrZone: 'Zone 1', pace: null,
      details: ['Full recovery day', 'Optional easy walk 20–30 minutes', 'Mobility 10 minutes', 'No hard effort'],
    },
    Monday: {
      title: 'Long Run', mileage: longRun, type: 'run', hrZone: 'Zone 2', pace: 'adaptive easy pace',
      details: [`Long run ${longRun} miles`, 'Zone 2 effort', '3 min warm-up jog', 'Main miles easy', '5 min cool down'],
    },
    Tuesday: {
      title: 'Easy Run', mileage: base, type: 'run', hrZone: 'Zone 2', pace: 'adaptive easy pace',
      details: [`Easy run ${base} miles`, 'Zone 2', 'Conversational effort', '3 min warm-up', '5 min cool down'],
    },
    Wednesday: {
      title: 'Strength + Mountain Bike', mileage: 0, type: 'strength-bike', hrZone: 'Zone 1–2', pace: null,
      details: ['Lower-body strength: squats 3 x 8', 'Romanian deadlifts 3 x 8', 'Step-ups 3 x 8 each leg', 'Calf raises 3 x 15'],
    },
    Thursday: {
      title: 'Easy Run', mileage: base, type: 'run', hrZone: 'Zone 2', pace: 'adaptive easy pace',
      details: [`Easy run ${base} miles`, 'Zone 2', 'Conversational effort', '3 min warm-up', '5 min cool down'],
    },
    Friday: {
      title: 'Strength + Road Bike', mileage: 0, type: 'strength-bike', hrZone: 'Zone 1–2', pace: null,
      details: ['Upper-body strength: push-ups 3 x 10', 'Rows 3 x 10', 'Shoulder press 3 x 8', 'Plank 3 x 45 sec'],
    },
    Saturday: {
      title: 'Tempo Run', mileage: tempo, type: 'run', hrZone: 'Zone 3–4', pace: 'adaptive tempo pace',
      details: [`Tempo run ${tempo} miles`, 'Zone 3–4', 'Controlled discomfort', '3 min warm-up', '5 min cool down'],
    },
  };
}

function getWeeklyPaceSummary(plan, weeklyEntries = []) {
  const runs = dayOrder.map((day) => plan[day]).filter((item) => item?.type === 'run');
  const loggedEasyPaces = weeklyEntries
    .filter((entry) => entry.workout === 'Easy Run' || entry.workout === 'Long Run')
    .map((entry) => parsePace(entry.pace))
    .filter(Boolean);
  const loggedTempoPaces = weeklyEntries
    .filter((entry) => entry.workout === 'Tempo Run')
    .map((entry) => parsePace(entry.pace))
    .filter(Boolean);

  const avg = (values, fallback) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
  const easyPaceValue = avg(loggedEasyPaces, 14);
  const tempoPaceValue = avg(loggedTempoPaces, 10.5);
  const easyMiles = runs.filter((item) => item.title !== 'Tempo Run').reduce((sum, item) => sum + item.mileage, 0);
  const tempoMiles = runs.filter((item) => item.title === 'Tempo Run').reduce((sum, item) => sum + item.mileage, 0);
  const totalMiles = easyMiles + tempoMiles;
  const combinedPaceValue = totalMiles ? (easyMiles * easyPaceValue + tempoMiles * tempoPaceValue) / totalMiles : 0;

  return {
    easyPace: formatPace(easyPaceValue), tempoPace: formatPace(tempoPaceValue), combinedPace: formatPace(combinedPaceValue),
    easyPaceValue, tempoPaceValue, combinedPaceValue,
  };
}

function getRunTime(miles, type, paceSummary) {
  const warmup = 3;
  const cooldown = 5;
  const pace = type === 'tempo' ? paceSummary?.tempoPaceValue || 10.5 : paceSummary?.easyPaceValue || 14;
  return warmup + miles * pace + cooldown;
}

function getBikeAdjustment(selected, rpe, soreness, sleep) {
  if (selected.type !== 'strength-bike') return { bikeMinutes: 0, advice: 'No bike scheduled today.' };
  const isMountain = selected.title.includes('Mountain');
  const normalBike = isMountain ? 40 : 50;
  let fatigue = 0;
  if (soreness >= 8) fatigue += 3;
  else if (soreness >= 6) fatigue += 2;
  else if (soreness >= 4) fatigue += 1;
  if (sleep <= 2) fatigue += 3;
  else if (sleep === 3) fatigue += 1;
  if (rpe >= 8) fatigue += 2;
  else if (rpe >= 7) fatigue += 1;
  if (fatigue >= 5) return { bikeMinutes: 0, advice: 'Skip bike today. Recovery risk is high.' };
  if (fatigue >= 3) return { bikeMinutes: isMountain ? 20 : 25, advice: 'Reduced bike time. Keep it Zone 1 only.' };
  if (fatigue >= 1) return { bikeMinutes: isMountain ? 30 : 40, advice: 'Slightly reduced bike time. Keep it smooth.' };
  return { bikeMinutes: normalBike, advice: 'Normal bike duration. Easy/moderate only.' };
}

function getMealPlan(day, selected) {
  const isLong = selected.title === 'Long Run';
  const isTempo = selected.title === 'Tempo Run';
  const isRun = selected.type === 'run';
  const carbAmount = isLong ? '8 oz' : isTempo ? '6–7 oz' : '6 oz';
  const dinnerTime = isLong ? '6:00 PM' : '6:30 PM';
  const snackTime = isLong ? '10:30 AM' : isTempo ? '10:45 AM' : '11:00 AM';
  const preRun = isLong
    ? 'Eat 1 banana + drink 12–16 oz water. Optional coffee.'
    : isTempo
      ? 'Optional: 1/2 to 1 banana + 12 oz water if sluggish.'
      : isRun
        ? 'Water only: drink 12 oz water. No banana required.'
        : 'Drink 12 oz water. No banana needed unless hungry.';
  return { carbs: carbRotation[day], breakfast: breakfastRotation[day], snackAM: snackRotation[day].am, snackPM: snackRotation[day].pm, carbAmount, dinnerTime, snackTime, preRun };
}

function getFuelingAlerts(selected, workoutStart, workoutDuration) {
  if (selected.title !== 'Long Run') return [];
  if ((selected.mileage || 0) < 8) return [{ key: 'fuel-note', time: 'During run', title: 'Fueling note', detail: 'No fuel needed unless energy drops. Sip water as needed.' }];
  const alerts = [];
  let minute = 45;
  let count = 1;
  while (minute < workoutDuration - 10) {
    alerts.push({ key: `fuel-${count}`, time: formatTime(workoutStart + minute), title: `Fuel #${count}`, detail: 'Take 1 gel OR 1/2 banana OR sports drink carbs. Sip water with it.' });
    minute += 35;
    count += 1;
  }
  return alerts;
}

function getSchedule(day, selected, rpe, soreness, sleep, wakeTime, paceSummary) {
  const meal = getMealPlan(day, selected);
  const wake = wakeTime;
  const preFuel = wake + 5;
  const stretch = wake + 15;
  const workoutStart = stretch + 20;
  const bikeAdjustment = getBikeAdjustment(selected, rpe, soreness, sleep);
  const strengthMinutes = selected.type === 'strength-bike' ? 45 : 0;
  const bikeMinutes = bikeAdjustment.bikeMinutes;
  const workoutDuration = selected.type === 'run'
    ? getRunTime(selected.mileage, selected.title === 'Tempo Run' ? 'tempo' : 'easy', paceSummary)
    : selected.type === 'strength-bike'
      ? strengthMinutes + bikeMinutes
      : 30;
  const workoutEnd = workoutStart + workoutDuration;

  const workoutItems = selected.type === 'strength-bike'
    ? [
        { key: 'strength', time: formatTime(workoutStart), title: 'Strength training', detail: `45 minutes: ${selected.details.join(' • ')}` },
        bikeMinutes > 0
          ? { key: 'bike', time: formatTime(workoutStart + strengthMinutes), title: selected.title.includes('Mountain') ? 'Mountain bike' : 'Road bike', detail: `${bikeMinutes} minutes. ${bikeAdjustment.advice}` }
          : { key: 'bike-skip', time: formatTime(workoutStart + strengthMinutes), title: 'Bike adjustment', detail: bikeAdjustment.advice },
      ]
    : [{ key: 'workout', time: formatTime(workoutStart), title: selected.title, detail: selected.details.join(' • ') }];

  return [
    { key: 'wake', time: formatTime(wake), title: 'Wake Up', detail: 'Get up. No snooze.' },
    { key: 'preFuel', time: formatTime(preFuel), title: 'Pre-workout fuel + Hydration', detail: meal.preRun + ' Drink 12–16 oz water.' },
    { key: 'stretch', time: formatTime(stretch), title: 'Mobility + Stretch', detail: '', checklist: selected.type === 'run' ? preRunMobility : mobilityRoutine },
    ...workoutItems,
    ...getFuelingAlerts(selected, workoutStart, workoutDuration),
    { key: 'finish', time: formatTime(workoutEnd), title: 'Workout complete', detail: 'Cool down, towel off, start recovery.' },
    { key: 'electrolytes', time: formatTime(workoutEnd + 5), title: 'Hydrate / electrolytes', detail: selected.title === 'Long Run' || selected.title === 'Tempo Run' ? 'Drink water plus electrolytes.' : 'Drink 12 oz water.' },
    { key: 'shake', time: formatTime(workoutEnd + 15), title: 'Protein shake', detail: '1 scoop whey + 8–12 oz water or milk + 1/2 banana + 1 tbsp peanut butter.' },
    { key: 'breakfast', time: formatTime(workoutEnd + 45), title: 'Breakfast', detail: meal.breakfast },
    { key: 'snackAM', time: meal.snackTime, title: 'Snack', detail: meal.snackAM },
    { key: 'lunch', time: '1:00 PM', title: 'Lunch', detail: `6 oz protein + ${meal.carbAmount} ${meal.carbs} + 4 oz vegetables + 12 oz water.` },
    { key: 'snackPM', time: '4:00 PM', title: 'Snack', detail: meal.snackPM },
    { key: 'dinner', time: meal.dinnerTime, title: 'Dinner', detail: `6 oz protein + ${meal.carbAmount} ${meal.carbs} + 4 oz vegetables + 12 oz water.` },
    { key: 'mobilityPM', time: '8:30 PM', title: 'Evening mobility', detail: 'Optional 8–10 minutes of light mobility.', checklist: mobilityRoutine.slice(0, 5) },
    { key: 'sleep', time: '10:30 PM', title: 'Sleep', detail: 'Lights out. Recovery is training.' },
  ];
}

function readJSON(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function average(values) {
  const nums = values.map(Number).filter((value) => !Number.isNaN(value));
  if (!nums.length) return '--';
  return Math.round((nums.reduce((sum, value) => sum + value, 0) / nums.length) * 10) / 10;
}

function getReadinessScore({ rpe, soreness, sleep, workoutTemp, weatherCondition }) {
  let score = 100;
  const temp = Number(workoutTemp);
  if (sleep <= 2) score -= 35;
  else if (sleep === 3) score -= 15;
  else if (sleep >= 4) score += 5;
  if (soreness >= 8) score -= 35;
  else if (soreness >= 6) score -= 22;
  else if (soreness >= 4) score -= 10;
  if (rpe >= 9) score -= 25;
  else if (rpe >= 8) score -= 18;
  else if (rpe >= 7) score -= 8;
  if (temp >= 90) score -= 25;
  else if (temp >= 80) score -= 15;
  else if (temp >= 70) score -= 6;
  else if (temp <= 25 && temp > 0) score -= 10;
  if (['Rain', 'Snow', 'Windy', 'Hot', 'Cold', 'Humid'].includes(weatherCondition)) score -= 8;
  if (weatherCondition === 'Snow') score -= 10;
  if (weatherCondition === 'Hot' || weatherCondition === 'Humid') score -= 6;
  const readiness = clamp(score, 0, 100);
  if (readiness < 50) return { score: readiness, level: 'Red', color: '#991b1b', label: 'Recover' };
  if (readiness < 75) return { score: readiness, level: 'Yellow', color: '#92400e', label: 'Modify' };
  return { score: readiness, level: 'Green', color: '#166534', label: 'Ready' };
}

function getInjuryRisk({ selected, rpe, soreness, sleep, avgHR }) {
  let score = 0;
  if (soreness >= 8) score += 35;
  else if (soreness >= 6) score += 25;
  else if (soreness >= 4) score += 12;
  if (sleep <= 2) score += 30;
  else if (sleep === 3) score += 15;
  if (rpe >= 9) score += 25;
  else if (rpe >= 8) score += 18;
  else if (rpe >= 7) score += 10;
  const heartRate = Number(avgHR);
  if (heartRate > 155 && selected.title !== 'Tempo Run') score += 15;
  if (selected.title === 'Long Run') score += 5;
  if (selected.title === 'Tempo Run') score += 8;
  const risk = clamp(score, 0, 100);
  if (risk >= 70) return { score: risk, level: 'High', color: '#991b1b', recommendation: 'High injury risk. Convert tomorrow to recovery or Zone 1 movement. Do not add intensity.' };
  if (risk >= 40) return { score: risk, level: 'Moderate', color: '#92400e', recommendation: 'Moderate risk. Reduce tomorrow’s volume or keep it very easy.' };
  return { score: risk, level: 'Low', color: '#166534', recommendation: 'Risk is low. Stay on plan and keep easy days easy.' };
}

function getAutoAdjustedWorkout(selected, readiness, injuryRisk, workoutTemp, weatherCondition) {
  const temp = Number(workoutTemp);
  const isHeat = temp >= 80 || weatherCondition === 'Hot' || weatherCondition === 'Humid';
  const isBadWeather = ['Rain', 'Snow', 'Windy', 'Cold'].includes(weatherCondition);
  if (injuryRisk.level === 'High' || readiness.level === 'Red') {
    return { status: 'Recovery Override', color: '#991b1b', title: 'Convert today to recovery', detail: 'Do 20–30 minutes easy walking or mobility only. No tempo, no hard biking, no extra miles.', multiplier: 0 };
  }
  if (readiness.level === 'Yellow' || injuryRisk.level === 'Moderate') {
    return { status: 'Modified Workout', color: '#92400e', title: selected.type === 'run' ? 'Reduce run volume 20–30%' : 'Strength only or short easy bike', detail: 'Keep effort controlled. Skip extra intensity and keep movement easy.', multiplier: 0.75 };
  }
  if (isHeat && selected.type === 'run') {
    return { status: 'Heat Adjustment', color: '#92400e', title: 'Slow pace and increase fluids', detail: 'Run by effort, not pace. Add 15–40 sec/mile depending on heat. Use electrolytes after the workout.', multiplier: 1 };
  }
  if (isBadWeather && selected.type === 'run') {
    return { status: 'Weather Adjustment', color: '#1d4ed8', title: 'Use caution with conditions', detail: 'Keep footing safe. If unsafe, move indoors or replace with easy bike/mobility.', multiplier: 1 };
  }
  return { status: 'On Plan', color: '#166534', title: 'Follow the planned workout', detail: 'Readiness looks good. Do not add extra mileage beyond the plan.', multiplier: 1 };
}

function getAdjustedMileage(selected, adjustment) {
  if (selected.type !== 'run') return selected.mileage;
  if (adjustment.multiplier === 0) return 0;
  return Math.round(selected.mileage * adjustment.multiplier * 10) / 10;
}

function getSmartAdjustments({ selected, rpe, soreness, sleep, avgHR, pace, readiness, injuryRisk }) {
  const messages = [];
  const heartRate = Number(avgHR);
  const paceMin = parsePace(pace);
  if (readiness.level === 'Red') messages.push('Readiness is red. Treat today as recovery unless this improves.');
  if (injuryRisk.level === 'High') messages.push('Adaptive recovery: tomorrow should become a recovery day unless symptoms improve.');
  if (injuryRisk.level === 'Moderate') messages.push('Adaptive recovery: reduce tomorrow’s training load and avoid extra miles.');
  if (sleep < 3) messages.push('Tomorrow: reduce intensity. Prioritize recovery because sleep was low.');
  if (soreness >= 8) messages.push('Tomorrow: replace hard work with Zone 1–2 movement or rest.');
  if (rpe >= 8 && selected.type.includes('run')) messages.push('Next similar run: slow down and stay controlled. This effort was too hard.');
  if (selected.title === 'Easy Run' && rpe > 6) messages.push('Easy run warning: your easy pace may be too fast. Keep it conversational.');
  if (selected.title === 'Tempo Run' && rpe < 5) messages.push('Tempo may be too easy. Next tempo, aim for controlled discomfort.');
  if (heartRate > 150 && selected.title !== 'Tempo Run') messages.push('HR looks high for an easy/long day. Use HR alerts and back off earlier.');
  if (selected.title === 'Tempo Run' && paceMin && paceMin < 10 && rpe >= 8) messages.push('Tempo may be too aggressive. Do not race the workout.');
  if (rpe <= 6 && soreness <= 5 && sleep >= 3 && injuryRisk.level === 'Low') messages.push('You are adapting well. Stay on plan and do not add extra mileage.');
  return messages.length ? messages : ['Stay consistent. Log your data honestly and keep easy days easy.'];
}

function getWeeklyCoachingSummary(entries, plannedMileage) {
  if (!entries.length) return 'Log workouts this week to unlock your weekly coaching summary.';
  const miles = entries.reduce((sum, entry) => sum + (Number(entry.mileage) || 0), 0);
  const avgRpe = average(entries.map((entry) => entry.rpe));
  const avgSoreness = average(entries.map((entry) => entry.soreness));
  const avgSleep = average(entries.map((entry) => entry.sleep));
  const mileagePercent = plannedMileage ? Math.round((miles / plannedMileage) * 100) : 0;
  const notes = [`You logged ${entries.length}/7 days and ${miles.toFixed(1)} miles (${mileagePercent}% of planned mileage).`];
  if (Number(avgSoreness) >= 7) notes.push('Soreness is trending high. Next week should emphasize recovery and mobility.');
  else if (Number(avgSoreness) <= 4) notes.push('Soreness looks controlled. Your body is handling the current load well.');
  if (Number(avgSleep) <= 2.5) notes.push('Sleep is the biggest limiter right now. Protect bedtime before adding stress.');
  else if (Number(avgSleep) >= 4) notes.push('Sleep quality is supporting recovery well.');
  if (Number(avgRpe) >= 7) notes.push('Average effort is high. Keep easy runs easier and avoid racing tempo days.');
  else if (Number(avgRpe) <= 6) notes.push('Effort balance looks good. Continue building without forcing pace.');
  if (mileagePercent < 70 && entries.length >= 4) notes.push('Mileage is behind plan. Do not cram missed miles; resume smoothly.');
  if (mileagePercent > 110) notes.push('Mileage is above plan. Avoid extra volume unless recovery is excellent.');
  return notes.join(' ');
}

function getMarathonPrediction(pace, selected) {
  const paceMin = parsePace(pace);
  if (!paceMin) return '--';
  const marathonPace = selected.title === 'Tempo Run' ? paceMin + 1.25 : paceMin;
  const total = marathonPace * 26.2;
  return `${Math.floor(total / 60)}h ${Math.round(total % 60)}m`;
}

function getWorkoutTheme(type) {
  if (type === 'run') return { header: '#16a34a', card: { borderTop: '6px solid #16a34a', background: '#ecfdf5' } };
  if (type === 'strength-bike') return { header: '#eab308', card: { borderTop: '6px solid #eab308', background: '#fefce8' } };
  return { header: '#dc2626', card: { borderTop: '6px solid #dc2626', background: '#fef2f2' } };
}

function getWorkoutIcon(type) {
  if (type === 'run') return '🏃';
  if (type === 'strength-bike') return '🏋️';
  return '🧘';
}

function getTaskIcon(item, selected) {
  const key = item.key.toLowerCase();
  if (key.includes('wake')) return '🌅';
  if (key.includes('fuel')) return '🍌';
  if (key.includes('stretch') || key.includes('mobility')) return '🧘';
  if (key.includes('workout')) return selected.type === 'run' ? '🏃' : '🏋️';
  if (key.includes('strength')) return '🏋️';
  if (key.includes('bike')) return '🚴';
  if (key.includes('finish')) return '✅';
  if (key.includes('electrolytes')) return '💧';
  if (key.includes('shake')) return '🥤';
  if (key.includes('breakfast')) return '🍳';
  if (key.includes('snack')) return '🍎';
  if (key.includes('lunch')) return '🥗';
  if (key.includes('dinner')) return '🍽️';
  if (key.includes('sleep')) return '🌙';
  return '•';
}

function getTaskColor(item, selected) {
  const key = item.key.toLowerCase();
  if (key.includes('workout') || key.includes('strength') || key.includes('bike')) {
    return selected.type === 'run' ? '#16a34a' : selected.type === 'strength-bike' ? '#eab308' : '#dc2626';
  }
  if (key.includes('fuel') || key.includes('shake') || key.includes('breakfast') || key.includes('snack') || key.includes('lunch') || key.includes('dinner')) return '#f97316';
  if (key.includes('sleep') || key.includes('wake') || key.includes('stretch') || key.includes('mobility')) return '#6366f1';
  if (key.includes('electrolytes')) return '#0ea5e9';
  return '#cbd5e1';
}

export default function App() {
  const [week, setWeek] = useState(() => Number(localStorage.getItem('week') || 1));
  const [day, setDay] = useState(() => localStorage.getItem('day') || 'Sunday');
  const [dark, setDark] = useState(() => readJSON('dark', false));
  const [checked, setChecked] = useState(() => readJSON('checked', {}));
  const [weeklyLogs, setWeeklyLogs] = useState(() => readJSON('weeklyLogs', {}));
  const [rpe, setRpe] = useState(() => Number(localStorage.getItem('rpe') || 5));
  const [soreness, setSoreness] = useState(() => Number(localStorage.getItem('soreness') || 3));
  const [sleep, setSleep] = useState(() => Number(localStorage.getItem('sleep') || 4));
  const [avgHR, setAvgHR] = useState(() => localStorage.getItem('avgHR') || '');
  const [pace, setPace] = useState(() => localStorage.getItem('pace') || '');
  const [distance, setDistance] = useState(() => localStorage.getItem('distance') || '');
  const [runTime, setRunTime] = useState(() => localStorage.getItem('runTime') || '');
  const [workoutTemp, setWorkoutTemp] = useState(() => localStorage.getItem('workoutTemp') || '');
  const [weatherCondition, setWeatherCondition] = useState(() => localStorage.getItem('weatherCondition') || 'Clear');
  const [notes, setNotes] = useState(() => localStorage.getItem('notes') || '');
  const [sunriseTime, setSunriseTime] = useState(() => localStorage.getItem('sunriseTime') || '6:45');

  const plan = useMemo(() => getWeekPlan(week), [week]);
  const selected = plan[day] || plan.Sunday;
  const weekKey = `week-${week}`;
  const weeklyEntries = Object.values(weeklyLogs[weekKey] || {});
  const paceSummary = useMemo(() => getWeeklyPaceSummary(plan, weeklyEntries), [plan, weeklyEntries]);
  const wakeTime = sunriseToWakeMinutes(sunriseTime);
  const schedule = useMemo(() => getSchedule(day, selected, rpe, soreness, sleep, wakeTime, paceSummary), [day, selected, rpe, soreness, sleep, wakeTime, paceSummary]);
  const completed = schedule.filter((item) => checked[item.key]).length;
  const progress = Math.round((completed / schedule.length) * 100);
  const weeklyMileage = dayOrder.reduce((sum, currentDay) => sum + (plan[currentDay]?.mileage || 0), 0);
  const performanceScore = clamp(Math.round(progress * 0.4 + (10 - Math.abs(rpe - 6)) * 4 + (6 - Math.abs(soreness - 3)) * 3 + sleep * 4 + (avgHR ? 8 : 0) + (pace ? 8 : 0)), 0, 100);
  const weeklyMiles = weeklyEntries.reduce((sum, item) => sum + (Number(item.mileage) || 0), 0);
  const readiness = getReadinessScore({ rpe, soreness, sleep, workoutTemp, weatherCondition });
  const injuryRisk = getInjuryRisk({ selected, rpe, soreness, sleep, avgHR });
  const autoAdjustment = getAutoAdjustedWorkout(selected, readiness, injuryRisk, workoutTemp, weatherCondition);
  const adjustedMileage = getAdjustedMileage(selected, autoAdjustment);
  const smartAdjustments = getSmartAdjustments({ selected, rpe, soreness, sleep, avgHR, pace, readiness, injuryRisk });
  const weeklySummary = getWeeklyCoachingSummary(weeklyEntries, weeklyMileage);
  const theme = dark ? darkTheme : lightTheme;
  const workoutTheme = getWorkoutTheme(selected.type);
  const workoutIcon = getWorkoutIcon(selected.type);

  useEffect(() => localStorage.setItem('week', String(week)), [week]);
  useEffect(() => localStorage.setItem('day', day), [day]);
  useEffect(() => localStorage.setItem('dark', JSON.stringify(dark)), [dark]);
  useEffect(() => localStorage.setItem('checked', JSON.stringify(checked)), [checked]);
  useEffect(() => localStorage.setItem('weeklyLogs', JSON.stringify(weeklyLogs)), [weeklyLogs]);
  useEffect(() => localStorage.setItem('rpe', String(rpe)), [rpe]);
  useEffect(() => localStorage.setItem('soreness', String(soreness)), [soreness]);
  useEffect(() => localStorage.setItem('sleep', String(sleep)), [sleep]);
  useEffect(() => localStorage.setItem('avgHR', avgHR), [avgHR]);
  useEffect(() => localStorage.setItem('pace', pace), [pace]);
  useEffect(() => localStorage.setItem('distance', distance), [distance]);
  useEffect(() => localStorage.setItem('runTime', runTime), [runTime]);
  useEffect(() => localStorage.setItem('workoutTemp', workoutTemp), [workoutTemp]);
  useEffect(() => localStorage.setItem('weatherCondition', weatherCondition), [weatherCondition]);
  useEffect(() => localStorage.setItem('notes', notes), [notes]);
  useEffect(() => localStorage.setItem('sunriseTime', sunriseTime), [sunriseTime]);

  const savePerformanceLog = () => {
    setWeeklyLogs((previous) => ({
      ...previous,
      [weekKey]: {
        ...(previous[weekKey] || {}),
        [day]: {
          day,
          workout: selected.title,
          mileage: selected.mileage,
          distance,
          runTime,
          rpe,
          soreness,
          sleep,
          avgHR,
          pace,
          workoutTemp,
          weatherCondition,
          progress,
          score: performanceScore,
          date: new Date().toLocaleDateString(),
        },
      },
    }));
  };

  const importRunSummary = () => {
    const imported = prompt('Paste: distance, time, avgHR (example: 5.2, 54:10, 148)');
    if (!imported) return;
    const [dist, time, hr] = imported.split(',').map((part) => part.trim());
    if (dist) setDistance(dist);
    if (time) setRunTime(time);
    if (hr) setAvgHR(hr);
    const calculated = calculatePaceFromDistanceTime(dist, time);
    if (calculated) setPace(calculated);
  };

  const nextDay = () => {
    const index = dayOrder.indexOf(day);
    if (index < dayOrder.length - 1) setDay(dayOrder[index + 1]);
    else {
      setWeek((current) => Math.min(28, current + 1));
      setDay('Sunday');
    }
    setChecked({});
  };

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <header style={{ ...styles.hero, background: theme.hero }}>
        <div>
          <div style={styles.eyebrow}>28-Week Marathon System</div>
          <h1 style={styles.title}>Marathon Coach</h1>
          <div style={styles.subtitle}>Training • Fueling • Recovery • Performance</div>
        </div>
        <button onClick={() => setDark((value) => !value)} style={styles.iconButton}>{dark ? '☀️' : '🌙'}</button>
      </header>

      <div style={styles.quickBar}>
        <button style={styles.quickButton}>🏃 Run</button>
        <button style={styles.quickButton}>🥤 Fuel</button>
        <button style={styles.quickButton}>📊 Log</button>
      </div>

      <section style={styles.grid}>
        <StatCard label="Week" value={week} />
        <StatCard label="Day" value={day} />
        <StatCard label="Weekly Miles" value={weeklyMileage.toFixed(1)} />
        <StatCard label="Score" value={`${performanceScore}/100`} />
        <StatCard label="Easy Avg Pace" value={paceSummary.easyPace} />
        <StatCard label="Tempo Avg Pace" value={paceSummary.tempoPace} />
        <StatCard label="Weekly Avg Pace" value={paceSummary.combinedPace} />
      </section>

      <section style={styles.card}>
        <div style={styles.selectRow}>
          <select value={week} onChange={(event) => setWeek(Number(event.target.value))} style={styles.input}>
            {Array.from({ length: 28 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Week {value}</option>)}
          </select>
          <select value={day} onChange={(event) => setDay(event.target.value)} style={styles.input}>
            {dayOrder.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <label style={styles.label}>Sunrise Time
            <input value={sunriseTime} onChange={(event) => setSunriseTime(event.target.value)} placeholder="6:45" style={styles.input} />
          </label>
        </div>
      </section>

      <section style={{ ...styles.card, ...workoutTheme.card }}>
        <div style={{ ...styles.workoutHeader, background: workoutTheme.header }}>
          <span style={styles.workoutIcon}>{workoutIcon}</span>
          <h2 style={{ ...styles.sectionTitle, margin: 0 }}>{day} — {selected.title}</h2>
        </div>
        <p><strong>Wake time:</strong> {formatTime(wakeTime)} (30 minutes before sunrise)</p>
        <p><strong>{selected.mileage} miles</strong> {selected.hrZone ? `• ${selected.hrZone}` : ''} {selected.pace ? `• ${selected.pace}` : ''}</p>
        <p><strong>Pace summary:</strong> Easy avg {paceSummary.easyPace} • Tempo avg {paceSummary.tempoPace} • Weekly run avg {paceSummary.combinedPace}</p>
        <ul style={styles.list}>{selected.details.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Today’s Full Schedule</h3>
        <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
        <p><strong>{progress}% complete</strong></p>
        {schedule.map((item) => (
          <div key={item.key} style={{ ...styles.taskCard, borderLeft: `6px solid ${getTaskColor(item, selected)}` }}>
            <label style={styles.taskMainRow}>
              <input type="checkbox" checked={Boolean(checked[item.key])} onChange={() => setChecked((previous) => ({ ...previous, [item.key]: !previous[item.key] }))} />
              <div>
                <strong>{getTaskIcon(item, selected)} {item.time} — {item.title}</strong>
                {item.detail && <div style={styles.detail}>{item.detail}</div>}
              </div>
            </label>
            {item.checklist && (
              <div style={styles.nestedChecklist}>
                {item.checklist.map((exercise) => {
                  const nestedKey = `${item.key}-${exercise.id}`;
                  return (
                    <label key={nestedKey} style={styles.nestedChecklistItem}>
                      <input type="checkbox" checked={Boolean(checked[nestedKey])} onChange={() => setChecked((previous) => ({ ...previous, [nestedKey]: !previous[nestedKey] }))} />
                      <span>{exercise.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Performance Tracking</h3>
        <div style={styles.formGrid}>
          <NumberInput label="RPE (1–10)" value={rpe} onChange={setRpe} min={1} max={10} />
          <NumberInput label="Soreness (1–10)" value={soreness} onChange={setSoreness} min={1} max={10} />
          <NumberInput label="Sleep Quality (1–5)" value={sleep} onChange={setSleep} min={1} max={5} />
          <TextInput label="Average HR" value={avgHR} onChange={setAvgHR} placeholder="145" />
          <TextInput label="Distance (miles)" value={distance} onChange={(value) => { setDistance(value); const calculated = calculatePaceFromDistanceTime(value, runTime); if (calculated) setPace(calculated); }} placeholder="5.20" />
          <TextInput label="Time (mm:ss or h:mm:ss)" value={runTime} onChange={(value) => { setRunTime(value); const calculated = calculatePaceFromDistanceTime(distance, value); if (calculated) setPace(calculated); }} placeholder="54:10" />
          <TextInput label="Pace (auto mm:ss)" value={pace} onChange={setPace} placeholder="10:25" />
          <TextInput label="Workout Temp (°F)" value={workoutTemp} onChange={setWorkoutTemp} placeholder="72" />
          <label style={styles.label}>Weather
            <select value={weatherCondition} onChange={(event) => setWeatherCondition(event.target.value)} style={styles.input}>
              <option>Clear</option>
              <option>Rain</option>
              <option>Snow</option>
              <option>Windy</option>
              <option>Hot</option>
              <option>Cold</option>
              <option>Humid</option>
              <option>Cloudy</option>
            </select>
          </label>
        </div>
        <button onClick={savePerformanceLog} style={styles.primaryButton}>Save Today’s Performance</button>
        <button onClick={importRunSummary} style={styles.secondaryButton}>Import Run Summary</button>
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Readiness Score</h3>
        <p style={{ color: readiness.color, fontWeight: 800 }}>{readiness.label} — {readiness.score}/100</p>
        <p><strong>{autoAdjustment.status}:</strong> {autoAdjustment.title}</p>
        <p>{autoAdjustment.detail}</p>
        {selected.type === 'run' && <p><strong>Adjusted mileage:</strong> {adjustedMileage} miles</p>}
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Injury Risk Score</h3>
        <p style={{ color: injuryRisk.color, fontWeight: 800 }}>{injuryRisk.level} Risk — {injuryRisk.score}/100</p>
        <p>{injuryRisk.recommendation}</p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Smart Coaching Adjustments</h3>
        {smartAdjustments.map((message) => <p key={message}>💡 {message}</p>)}
        <p><strong>Estimated marathon time:</strong> {getMarathonPrediction(pace, selected)}</p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Weekly Performance Dashboard</h3>
        <p><strong>Weekly Coach Summary:</strong> {weeklySummary}</p>
        <div style={styles.grid}>
          <StatCard label="Days Logged" value={`${weeklyEntries.length}/7`} />
          <StatCard label="Miles Logged" value={weeklyMiles.toFixed(1)} />
          <StatCard label="Avg RPE" value={average(weeklyEntries.map((entry) => entry.rpe))} />
          <StatCard label="Avg Soreness" value={average(weeklyEntries.map((entry) => entry.soreness))} />
          <StatCard label="Avg Sleep" value={average(weeklyEntries.map((entry) => entry.sleep))} />
        </div>
        {weeklyEntries.length > 0 && (
          <ul style={styles.list}>
            {weeklyEntries.map((entry) => (
              <li key={entry.day}>{entry.day}: {entry.workout}, {entry.distance || entry.mileage} mi, time {entry.runTime || '--'}, pace {entry.pace || '--'}, temp {entry.workoutTemp || '--'}°F, weather {entry.weatherCondition || '--'}, RPE {entry.rpe}, soreness {entry.soreness}, sleep {entry.sleep}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Notes</h3>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} style={styles.textarea} placeholder="How did you feel? Any pain? Garmin notes?" />
      </section>

      <div style={styles.buttonRow}>
        <button onClick={nextDay} style={styles.primaryButton}>Complete Day → Next</button>
        <button onClick={() => setChecked({})} style={styles.secondaryButton}>Reset Checklist</button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max }) {
  return (
    <label style={styles.label}>{label}
      <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} style={styles.input} />
    </label>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label style={styles.label}>{label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={styles.input} />
    </label>
  );
}

const lightTheme = { bg: '#f8fafc', text: '#111827', hero: 'linear-gradient(135deg,#111827,#334155)' };
const darkTheme = { bg: '#0f172a', text: '#f8fafc', hero: 'linear-gradient(135deg,#020617,#1e293b)' };

const styles = {
  page: { padding: 16, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', maxWidth: 980, margin: '0 auto', minHeight: '100vh' },
  hero: { color: 'white', borderRadius: 24, padding: 22, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  eyebrow: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#cbd5e1' },
  title: { margin: '4px 0', fontSize: 32 },
  subtitle: { color: '#d1d5db' },
  iconButton: { padding: 10, borderRadius: 12, border: 'none', background: 'white', cursor: 'pointer' },
  quickBar: { display: 'flex', gap: 10, marginBottom: 14 },
  quickButton: { flex: 1, padding: 12, borderRadius: 14, border: 'none', background: '#111827', color: 'white', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 14 },
  card: { padding: 16, borderRadius: 18, background: 'white', color: '#111827', marginBottom: 14, boxShadow: '0 4px 14px rgba(15,23,42,.06)', border: '1px solid #e5e7eb' },
  statCard: { padding: 14, borderRadius: 16, background: 'white', color: '#111827', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(15,23,42,.04)' },
  statLabel: { fontSize: 13, color: '#64748b' },
  statValue: { fontSize: 22, fontWeight: 800, marginTop: 4 },
  sectionTitle: { marginTop: 0 },
  workoutHeader: { color: 'white', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, boxShadow: '0 8px 18px rgba(15,23,42,.12)' },
  workoutIcon: { fontSize: 28 },
  selectRow: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' },
  input: { width: '100%', padding: 10, borderRadius: 12, border: '1px solid #d1d5db', marginTop: 4 },
  label: { display: 'grid', gap: 4, fontWeight: 700 },
  formGrid: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' },
  list: { paddingLeft: 20 },
  taskCard: { padding: 12, border: '1px solid #e5e7eb', borderRadius: 14, marginBottom: 8, background: '#f9fafb' },
  taskMainRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  nestedChecklist: { marginTop: 10, paddingLeft: 28, display: 'grid', gap: 6 },
  nestedChecklistItem: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 },
  detail: { fontSize: 13, opacity: 0.75, marginTop: 3 },
  progressTrack: { height: 10, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', background: '#111827' },
  primaryButton: { padding: '12px 14px', borderRadius: 14, border: 'none', background: '#111827', color: 'white', fontWeight: 800, cursor: 'pointer', marginTop: 12 },
  secondaryButton: { padding: '12px 14px', borderRadius: 14, border: '1px solid #cbd5e1', background: 'white', color: '#111827', fontWeight: 800, cursor: 'pointer', marginTop: 12, marginLeft: 8 },
  textarea: { width: '100%', height: 120, borderRadius: 14, border: '1px solid #d1d5db', padding: 12 },
  buttonRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
};
