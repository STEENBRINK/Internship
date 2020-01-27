using System;

namespace Modules.DestroyOutOfBounds
{
    [Serializable]
    public class NoAspectRatioSetException: Exception
    {
        public NoAspectRatioSetException():
            base(String.Format("You did not set a Maxbounds not a AspectRatio Component")){}
    }
}