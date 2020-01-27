using System;

namespace Modules.SceneHandling.FlowHandling
{
    [Serializable]
    public class NoEnabledSceneFoundException: Exception
    {
        public NoEnabledSceneFoundException():
            base(String.Format("You tried to go to a disabled scene")) {}

        public NoEnabledSceneFoundException(String action) :
            base(String.Format("No scene found for operation: " + action)) {}
    }
}