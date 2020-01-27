using System;

namespace Modules.AudioHandler.Core
{
    public class MultipleAudioSourcesComponentsFoundException: Exception
    {
        public MultipleAudioSourcesComponentsFoundException():
            base(String.Format("Multiple AudioSources components were found, only use one")) {}
    }
}