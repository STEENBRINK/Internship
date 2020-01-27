using System;

namespace Modules.SceneHandling.FlowHandling
{
    public class TriedToLoadDisabledSceneException: Exception
    {
        
        public TriedToLoadDisabledSceneException():
            base(String.Format("You tried to load a disabled scene")) {}
    }
}