using System;

namespace Modules.SceneHandling.FlowHandling
{
    [Serializable]
    public class NoEntitiesFoundException : Exception
    {
        public NoEntitiesFoundException() :
            base(String.Format("No Entites where found")) {}
    }
}