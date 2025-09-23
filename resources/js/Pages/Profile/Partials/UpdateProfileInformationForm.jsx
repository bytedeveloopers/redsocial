import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            avatar: null,
            _method: 'PATCH',
        });

    const submit = (e) => {
        e.preventDefault();
        
        // Usar POST con _method PATCH para manejar archivos
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Información del Perfil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Actualiza la información de tu cuenta y personaliza tu perfil.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Avatar */}
                <div>
                    <InputLabel htmlFor="avatar" value="Avatar" />
                    <div className="mt-2 flex items-center gap-4">
                        {user.avatar_path ? (
                            <img 
                                src={`/storage/${user.avatar_path}`} 
                                alt="Avatar actual"
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('avatar', e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <InputError className="mt-2" message={errors.avatar} />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Bio */}
                <div>
                    <InputLabel htmlFor="bio" value="Biografía" />
                    <textarea
                        id="bio"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Cuéntanos algo sobre ti..."
                        maxLength={500}
                    />
                    <p className="mt-1 text-sm text-gray-500">{data.bio.length}/500 caracteres</p>
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                {/* Ubicación */}
                <div>
                    <InputLabel htmlFor="location" value="Ubicación" />
                    <TextInput
                        id="location"
                        className="mt-1 block w-full"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        placeholder="Ciudad, País"
                        autoComplete="address-level1"
                    />
                    <InputError className="mt-2" message={errors.location} />
                </div>

                {/* Sitio web */}
                <div>
                    <InputLabel htmlFor="website" value="Sitio web" />
                    <TextInput
                        id="website"
                        type="url"
                        className="mt-1 block w-full"
                        value={data.website}
                        onChange={(e) => setData('website', e.target.value)}
                        placeholder="https://tu-sitio-web.com"
                        autoComplete="url"
                    />
                    <InputError className="mt-2" message={errors.website} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
