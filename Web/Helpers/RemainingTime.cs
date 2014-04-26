using System;

namespace Web.Helpers
{
    //http://maran.ro/2012/04/19/helper-c-pentru-timpul-ramas/
    public static class RemainingTime
    {
        static readonly DateTime yearEnd = new DateTime(2042, 12, 31);
        public static long Ticks()
        {
            return yearEnd.Ticks - DateTime.Now.Ticks;
        }
        public static long Seconds()
        {
            TimeSpan remainingSeconds = new TimeSpan(Ticks());
            return (long)remainingSeconds.TotalSeconds;
        }
        public static long Minutes()
        {
            TimeSpan remainingSeconds = new TimeSpan(Ticks());
            return (long)remainingSeconds.TotalMinutes;
        }
        public static long Hours()
        {
            TimeSpan remainingSeconds = new TimeSpan(Ticks());
            return (long)remainingSeconds.TotalHours;
        }
        public static long Days()
        {
            TimeSpan remainingSeconds = new TimeSpan(Ticks());
            return (long)remainingSeconds.TotalDays;
        }
    }
}